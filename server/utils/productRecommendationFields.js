const VALID_SKIN_TYPES = ['oily', 'dry', 'combination', 'sensitive', 'normal'];
const VALID_CONCERNS = ['acne', 'dryness', 'oil control', 'sensitivity', 'pigmentation', 'aging'];

const BENEFIT_TO_CONCERN = {
  'acne treatment': 'acne',
  'oil control': 'oil control',
  hydration: 'dryness',
  soothing: 'sensitivity',
  brightening: 'pigmentation',
};

const normalizeStringArray = (values = []) => {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);
};

const filterByAllowedValues = (values, allowedValues) => {
  const normalizedValues = normalizeStringArray(values);
  const allowedSet = new Set(allowedValues);

  return Array.from(new Set(normalizedValues)).filter((value) => allowedSet.has(value));
};

const inferConcerns = (product) => {
  const concerns = new Set();

  normalizeStringArray(product.benefits).forEach((benefit) => {
    const mappedConcern = BENEFIT_TO_CONCERN[benefit];
    if (mappedConcern) concerns.add(mappedConcern);
  });

  const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  if (text.includes('acne') || text.includes('breakout')) concerns.add('acne');
  if (text.includes('aging') || text.includes('retinol') || text.includes('wrinkle') || text.includes('firm')) concerns.add('aging');
  if (text.includes('pigment') || text.includes('dark spot') || text.includes('brighten')) concerns.add('pigmentation');

  if (concerns.size === 0) concerns.add('dryness');

  return filterByAllowedValues(Array.from(concerns), VALID_CONCERNS);
};

const inferSkinTypes = (product, concerns) => {
  const skinTypes = new Set();
  const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();

  if (concerns.includes('oil control') || concerns.includes('acne')) {
    skinTypes.add('oily');
    skinTypes.add('combination');
  }

  if (concerns.includes('dryness')) {
    skinTypes.add('dry');
    skinTypes.add('normal');
  }

  if (concerns.includes('sensitivity') || text.includes('sensitive')) {
    skinTypes.add('sensitive');
    skinTypes.add('normal');
  }

  if (concerns.includes('pigmentation') || concerns.includes('aging')) {
    skinTypes.add('normal');
    skinTypes.add('combination');
  }

  if (String(product.category) === 'Sunscreen') {
    VALID_SKIN_TYPES.forEach((type) => skinTypes.add(type));
  }

  if (skinTypes.size === 0) {
    VALID_SKIN_TYPES.forEach((type) => skinTypes.add(type));
  }

  return filterByAllowedValues(Array.from(skinTypes), VALID_SKIN_TYPES);
};

const buildRecommendationFields = (product, options = {}) => {
  const { preserveExisting = true } = options;

  const existingConcerns = filterByAllowedValues(product.concerns, VALID_CONCERNS);
  const concerns = preserveExisting && existingConcerns.length > 0
    ? existingConcerns
    : inferConcerns(product);

  const existingSkinTypes = filterByAllowedValues(product.skinTypes, VALID_SKIN_TYPES);
  const skinTypes = preserveExisting && existingSkinTypes.length > 0
    ? existingSkinTypes
    : inferSkinTypes(product, concerns);

  return {
    skinTypes,
    concerns,
  };
};

module.exports = {
  VALID_SKIN_TYPES,
  VALID_CONCERNS,
  buildRecommendationFields,
};
