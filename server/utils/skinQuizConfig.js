const SKIN_QUIZ_QUESTIONS = [
  {
    id: 'skinAfterWashing',
    question: 'How does your skin feel 30 minutes after washing?',
    options: [
      { id: 'tight_flaky', text: 'Very tight and flaky', scores: { oily: 0, dry: 2, sensitive: 1, acne: 0 } },
      { id: 'comfortable', text: 'Comfortable and balanced', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'slightly_oily', text: 'Slightly oily in some areas', scores: { oily: 1, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'very_oily', text: 'Very oily quickly', scores: { oily: 2, dry: 0, sensitive: 0, acne: 1 } },
    ],
  },
  {
    id: 'daytimeOiliness',
    question: 'How oily does your skin get during the day?',
    options: [
      { id: 'not_oily', text: 'Not oily at all', scores: { oily: 0, dry: 1, sensitive: 0, acne: 0 } },
      { id: 'tzone_only', text: 'Only T-zone gets oily', scores: { oily: 1, dry: 1, sensitive: 0, acne: 0 } },
      { id: 'moderately_oily', text: 'Moderately oily overall', scores: { oily: 2, dry: 0, sensitive: 0, acne: 1 } },
      { id: 'very_oily', text: 'Very oily and shiny', scores: { oily: 2, dry: 0, sensitive: 0, acne: 2 } },
    ],
  },
  {
    id: 'acneFrequency',
    question: 'How often do you experience breakouts or acne?',
    options: [
      { id: 'rarely', text: 'Rarely or never', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'monthly', text: 'Occasionally (monthly)', scores: { oily: 1, dry: 0, sensitive: 0, acne: 1 } },
      { id: 'weekly', text: 'Frequently (weekly)', scores: { oily: 1, dry: 0, sensitive: 0, acne: 2 } },
      { id: 'constant', text: 'Almost constant acne', scores: { oily: 2, dry: 0, sensitive: 1, acne: 2 } },
    ],
  },
  {
    id: 'skinSensitivity',
    question: 'How often does your skin get red, itchy, or irritated?',
    options: [
      { id: 'never', text: 'Almost never', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'sometimes', text: 'Sometimes', scores: { oily: 0, dry: 0, sensitive: 1, acne: 0 } },
      { id: 'often', text: 'Often', scores: { oily: 0, dry: 0, sensitive: 2, acne: 0 } },
      { id: 'very_often', text: 'Very often', scores: { oily: 0, dry: 1, sensitive: 2, acne: 0 } },
    ],
  },
  {
    id: 'tzoneBehavior',
    question: 'How does your T-zone behave compared to your cheeks?',
    options: [
      { id: 'all_dry', text: 'Both are dry', scores: { oily: 0, dry: 2, sensitive: 0, acne: 0 } },
      { id: 'balanced', text: 'Both are balanced', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'tzone_oily', text: 'T-zone oily, cheeks normal', scores: { oily: 2, dry: 1, sensitive: 0, acne: 1 } },
      { id: 'all_oily', text: 'Both are oily', scores: { oily: 2, dry: 0, sensitive: 0, acne: 1 } },
    ],
  },
  {
    id: 'newProductReaction',
    question: 'How does your skin react to new skincare products?',
    options: [
      { id: 'no_reaction', text: 'No reaction', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'mild_reaction', text: 'Mild temporary reaction', scores: { oily: 0, dry: 0, sensitive: 1, acne: 0 } },
      { id: 'frequent_irritation', text: 'Frequent irritation', scores: { oily: 0, dry: 0, sensitive: 2, acne: 0 } },
      { id: 'breakouts_irritation', text: 'Breakouts or strong irritation', scores: { oily: 1, dry: 0, sensitive: 2, acne: 2 } },
    ],
  },
  {
    id: 'poreVisibility',
    question: 'How visible are your pores?',
    options: [
      { id: 'barely_visible', text: 'Barely visible', scores: { oily: 0, dry: 1, sensitive: 0, acne: 0 } },
      { id: 'slightly_visible', text: 'Slightly visible', scores: { oily: 1, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'visible_tzone', text: 'Visible mostly in T-zone', scores: { oily: 2, dry: 0, sensitive: 0, acne: 1 } },
      { id: 'very_visible', text: 'Very visible all over', scores: { oily: 2, dry: 0, sensitive: 0, acne: 2 } },
    ],
  },
  {
    id: 'sunExposureHabits',
    question: 'How often are you exposed to direct sunlight without SPF?',
    options: [
      { id: 'almost_never', text: 'Almost never', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'sometimes', text: 'Sometimes', scores: { oily: 0, dry: 0, sensitive: 1, acne: 0 } },
      { id: 'often', text: 'Often', scores: { oily: 0, dry: 1, sensitive: 1, acne: 0 } },
      { id: 'daily', text: 'Daily', scores: { oily: 0, dry: 1, sensitive: 2, acne: 0 } },
    ],
  },
  {
    id: 'hydrationLevel',
    question: 'How much water do you drink daily?',
    options: [
      { id: 'very_low', text: 'Less than 1 liter', scores: { oily: 0, dry: 2, sensitive: 1, acne: 0 } },
      { id: 'low', text: '1 to 1.5 liters', scores: { oily: 0, dry: 1, sensitive: 0, acne: 0 } },
      { id: 'moderate', text: '1.5 to 2 liters', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'high', text: 'More than 2 liters', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
    ],
  },
  {
    id: 'allergyTrigger',
    question: 'What ingredients does your skin react to?',
    options: [
      { id: 'none', text: 'No known allergies', scores: { oily: 0, dry: 0, sensitive: 0, acne: 0 } },
      { id: 'fragrance', text: 'Fragrance or perfumes', scores: { oily: 0, dry: 0, sensitive: 2, acne: 0 } },
      { id: 'alcohol', text: 'Alcohol-based products', scores: { oily: 0, dry: 1, sensitive: 2, acne: 0 } },
      { id: 'actives', text: 'Certain active ingredients (e.g., acids, retinol)', scores: { oily: 0, dry: 0, sensitive: 2, acne: 0 } },
    ],
  },
];

const ALLERGY_MAP = {
  none: [],
  fragrance: ['fragrance'],
  alcohol: ['alcohol'],
  actives: ['retinol', 'aha', 'bha'],
};

const SCORE_KEYS = ['oily', 'dry', 'sensitive', 'acne'];

const normalizeScoreObject = (scoreObj = {}) => {
  const normalized = {};

  SCORE_KEYS.forEach((key) => {
    normalized[key] = Number(scoreObj[key] || 0);
  });

  return normalized;
};

const buildOverrideLookup = (optionWeightOverrides = []) => {
  const lookup = new Map();

  optionWeightOverrides.forEach((override) => {
    if (!override?.questionId || !override?.optionId) return;
    const compositeKey = `${override.questionId}::${override.optionId}`;
    lookup.set(compositeKey, normalizeScoreObject(override.scores));
  });

  return lookup;
};

const buildQuizQuestionsWithOverrides = (baseQuestions, optionWeightOverrides = []) => {
  const overrideLookup = buildOverrideLookup(optionWeightOverrides);

  return baseQuestions.map((question) => ({
    ...question,
    options: question.options.map((option) => {
      const compositeKey = `${question.id}::${option.id}`;
      const overrideScores = overrideLookup.get(compositeKey);

      return {
        ...option,
        scores: overrideScores || normalizeScoreObject(option.scores),
      };
    }),
  }));
};

module.exports = {
  SKIN_QUIZ_QUESTIONS,
  ALLERGY_MAP,
  buildQuizQuestionsWithOverrides,
};
