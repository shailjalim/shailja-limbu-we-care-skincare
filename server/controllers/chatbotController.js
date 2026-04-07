const { GoogleGenerativeAI } = require('@google/generative-ai');
const SkinProfile = require('../models/SkinProfile');
const Product = require('../models/Product');
const Conversation = require('../models/Conversation');
const { getRecommendedProducts } = require('../utils/productRecommendation');

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_ITEMS = 5;
const FALLBACK_REPLY = 'I could not generate a response right now. Please try again in a moment.';

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

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
      // Save fallback response to conversation
      conversation.messages.push({ role: 'assistant', content: FALLBACK_REPLY });
      await conversation.save();
      return res.status(200).json({
        reply: FALLBACK_REPLY,
      });
    }

    const history = sanitizeHistory(req.body?.history);
    const prompt = buildPrompt(profile, recommendedProducts, message, history);

    const model = geminiClient.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text()?.trim() || FALLBACK_REPLY;

    // Save assistant response to conversation
    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error('chatWithAssistant error', error);
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
