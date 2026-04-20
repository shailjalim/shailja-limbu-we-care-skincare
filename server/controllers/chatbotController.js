const { GoogleGenerativeAI } = require('@google/generative-ai');
const SkinProfile = require('../models/SkinProfile');
const Product = require('../models/Product');
const Conversation = require('../models/Conversation');
const { getRecommendedProducts } = require('../utils/productRecommendation');

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_ITEMS = 5;
const FALLBACK_REPLY = 'I could not generate a response right now. Please try again in a moment.';
const GEMINI_MAX_ATTEMPTS = 2;
const GEMINI_RETRY_DELAY_MS = 350;
const GEMINI_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
];
const GEMINI_DISCOVERY_CACHE_TTL_MS = 10 * 60 * 1000;

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const geminiModelDiscoveryCache = {
  model: null,
  checkedAt: 0,
};

const sanitizeHistory = (history) => {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-MAX_HISTORY_ITEMS)
    .filter((item) => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
    .map((item) => ({ role: item.role, content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH) }));
};

const buildPrompt = (profile, recommendedProducts, message, history) => {
  const concerns = profile.concerns?.length ? profile.concerns.join(', ') : 'none provided';
  const allergies = profile.allergies?.length ? profile.allergies.join(', ') : 'none provided';
  const productNames = recommendedProducts.length
    ? recommendedProducts
        .map((product) => product.name)
        .join(', ')
    : 'No products available';

  const historyText = history.length
    ? history
        .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content}`)
        .join('\n')
    : 'No previous messages.';

  return `You are a professional skincare assistant.

User Profile:
- Skin Type: ${profile.skinType || 'unknown'}
- Concerns: ${concerns}
- Allergies: ${allergies}
- Sensitivity: ${profile.sensitivityLevel || 'unknown'}

Recommended Products:
${productNames}

Recent Conversation:
${historyText}

User Question:
${message}

Instructions:
- Provide safe skincare advice
- Avoid ingredients listed in allergies
- Suggest routine steps if relevant
- Keep answer simple and under 150 words
- If recommending products, use only provided product list`;
};

const buildLocalReply = (profile, recommendedProducts, message) => {
  const skinType = profile?.skinType || 'unknown';
  const concerns = Array.isArray(profile?.concerns) ? profile.concerns : [];
  const allergies = Array.isArray(profile?.allergies) ? profile.allergies : [];
  const topProducts = recommendedProducts.slice(0, 2).map((product) => product.name);

  const concernLine = concerns.length
    ? `Main concerns detected: ${concerns.join(', ')}.`
    : 'No specific concerns were detected in your profile yet.';

  const allergyLine = allergies.length
    ? `Avoid products with: ${allergies.join(', ')}.`
    : 'No allergy restrictions are currently saved in your profile.';

  const productLine = topProducts.length
    ? `You can start with: ${topProducts.join(' and ')}.`
    : 'No matching products were found right now. You can still follow the routine steps below.';

  const lowerMessage = String(message || '').toLowerCase();
  const routineType = lowerMessage.includes('night') ? 'night' : 'morning';

  const routineLine = routineType === 'night'
    ? 'Suggested night routine: Cleanser -> Toner -> Serum -> Moisturizer.'
    : 'Suggested morning routine: Cleanser -> Toner -> Serum -> Moisturizer -> Sunscreen.';

  return [
    `I am having trouble reaching the AI service, but here is safe guidance for your ${skinType} skin.`,
    concernLine,
    allergyLine,
    routineLine,
    productLine,
  ].join(' ');
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryGeminiError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  const status = Number(error?.status || error?.code || error?.response?.status || 0);

  // Retry transient provider/network issues that commonly happen on first attempt.
  return (
    [429, 500, 502, 503, 504].includes(status) ||
    message.includes('overloaded') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('temporar') ||
    message.includes('unavailable') ||
    message.includes('econnreset') ||
    message.includes('etimedout')
  );
};

const getGeminiModelCandidates = () => {
  const configuredModel = String(process.env.GEMINI_MODEL || '').trim();
  const ordered = configuredModel
    ? [configuredModel, ...GEMINI_FALLBACK_MODELS]
    : [...GEMINI_FALLBACK_MODELS];

  return Array.from(new Set(ordered.filter(Boolean)));
};

const normalizeModelName = (name) => String(name || '').replace(/^models\//, '').trim();

const discoverAvailableGeminiModel = async () => {
  const now = Date.now();
  if (
    geminiModelDiscoveryCache.model &&
    now - geminiModelDiscoveryCache.checkedAt < GEMINI_DISCOVERY_CACHE_TTL_MS
  ) {
    return geminiModelDiscoveryCache.model;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const models = Array.isArray(payload?.models) ? payload.models : [];
    const generativeModels = models
      .filter((model) => Array.isArray(model?.supportedGenerationMethods) && model.supportedGenerationMethods.includes('generateContent'))
      .map((model) => normalizeModelName(model?.name))
      .filter(Boolean);

    if (!generativeModels.length) {
      return null;
    }

    const preferred = getGeminiModelCandidates().map(normalizeModelName);
    const selectedModel = preferred.find((candidate) => generativeModels.includes(candidate)) || generativeModels[0];

    geminiModelDiscoveryCache.model = selectedModel;
    geminiModelDiscoveryCache.checkedAt = now;
    return selectedModel;
  } catch (_error) {
    return null;
  }
};

const generateReplyWithRetry = async (prompt) => {
  const modelCandidates = [...getGeminiModelCandidates()];
  let lastError = null;
  let lastModelTried = null;
  let discoveredModelTried = false;

  for (let modelIndex = 0; modelIndex < modelCandidates.length; modelIndex += 1) {
    const modelName = modelCandidates[modelIndex];
    lastModelTried = modelName;
    const model = geminiClient.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const reply = response.text()?.trim();
        return reply || FALLBACK_REPLY;
      } catch (error) {
        lastError = error;
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `Gemini generate failed for model=${modelName} attempt=${attempt}:`,
            error?.status || error?.code || '',
            error?.message || ''
          );
        }
        if (attempt >= GEMINI_MAX_ATTEMPTS || !shouldRetryGeminiError(error)) {
          const status = Number(error?.status || error?.code || error?.response?.status || 0);
          if (status === 404 && !discoveredModelTried) {
            const discoveredModel = await discoverAvailableGeminiModel();
            discoveredModelTried = true;
            const normalizedDiscovered = normalizeModelName(discoveredModel);
            if (
              normalizedDiscovered &&
              !modelCandidates.map(normalizeModelName).includes(normalizedDiscovered)
            ) {
              modelCandidates.push(normalizedDiscovered);
              if (process.env.NODE_ENV === 'development') {
                console.warn(`Gemini discovered fallback model: ${normalizedDiscovered}`);
              }
            }
          }
          break;
        }
        await wait(GEMINI_RETRY_DELAY_MS * attempt);
      }
    }
  }

  if (lastError && lastModelTried) {
    lastError.message = `[model=${lastModelTried}] ${lastError.message || 'Gemini request failed'}`;
  }

  throw lastError || new Error('Failed to generate chatbot reply');
};

exports.chatWithAssistant = async (req, res) => {
  try {
    const rawMessage = typeof req.body?.message === 'string' ? req.body.message : '';
    const message = rawMessage.trim();

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
      });
    }

    const profile = await SkinProfile.findOne({ user: req.user._id }).lean();
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Skin profile not found. Please complete your skin quiz first.',
      });
    }

    const products = await Product.find({}).limit(20).lean();
    const recommendedProducts = getRecommendedProducts(profile, products, { limit: 5 });

    // Save user message to conversation
    let conversation = await Conversation.findOne({ user: req.user._id });
    if (!conversation) {
      conversation = new Conversation({ user: req.user._id, skinProfile: profile._id, messages: [] });
    }
    conversation.messages.push({ role: 'user', content: message });
    await conversation.save();

    if (!geminiClient) {
      const fallbackReply = buildLocalReply(profile, recommendedProducts, message);
      // Save fallback response to conversation
      conversation.messages.push({ role: 'assistant', content: fallbackReply });
      await conversation.save();
      return res.status(200).json({
        reply: fallbackReply,
      });
    }

    const history = sanitizeHistory(req.body?.history);
    const prompt = buildPrompt(profile, recommendedProducts, message, history);

    const reply = await generateReplyWithRetry(prompt);

    // Save assistant response to conversation
    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error('chatWithAssistant error', error);
    try {
      const profile = await SkinProfile.findOne({ user: req.user?._id }).lean();
      const products = await Product.find({}).limit(20).lean();
      const recommendedProducts = profile ? getRecommendedProducts(profile, products, { limit: 5 }) : [];
      const fallbackReply = buildLocalReply(profile || {}, recommendedProducts, req.body?.message || '');
      return res.status(200).json({
        reply: fallbackReply,
      });
    } catch (_fallbackError) {
      // If fallback generation also fails, return the generic safe message.
    }
    return res.status(200).json({
      reply: FALLBACK_REPLY,
    });
  }
};

// Get user's conversation history
exports.getChatHistory = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ user: req.user._id });
    if (!conversation) {
      return res.status(200).json({ messages: [] });
    }
    return res.status(200).json({ messages: conversation.messages });
  } catch (error) {
    console.error('getChatHistory error', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve chat history' });
  }
};

// Clear user's conversation history
exports.clearChatHistory = async (req, res) => {
  try {
    const result = await Conversation.findOneAndUpdate(
      { user: req.user._id },
      { messages: [], updatedAt: Date.now() },
      { new: true }
    );
    return res.status(200).json({ success: true, message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('clearChatHistory error', error);
    return res.status(500).json({ success: false, message: 'Failed to clear chat history' });
  }
};
