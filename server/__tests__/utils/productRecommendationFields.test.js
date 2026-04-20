const {
  VALID_CONCERNS,
  VALID_SKIN_TYPES,
  buildRecommendationFields,
} = require('../../utils/productRecommendationFields');

describe('productRecommendationFields', () => {
  test('preserves valid existing concerns and skin types by default', () => {
    const product = {
      concerns: ['acne', 'invalid-concern'],
      skinTypes: ['oily', 'invalid-type'],
      name: 'Any',
      description: 'Any',
    };

    const result = buildRecommendationFields(product);

    expect(result).toEqual({
      concerns: ['acne'],
      skinTypes: ['oily'],
    });
  });

  test('infers fields when preserveExisting is false', () => {
    const product = {
      name: 'Brightening Retinol Serum',
      description: 'Helps with dark spots and aging signs',
      benefits: ['brightening'],
      category: 'Serum',
    };

    const result = buildRecommendationFields(product, { preserveExisting: false });

    expect(result.concerns).toEqual(expect.arrayContaining(['pigmentation', 'aging']));
    expect(result.skinTypes).toEqual(expect.arrayContaining(['normal', 'combination']));
    expect(result.skinTypes.every((type) => VALID_SKIN_TYPES.includes(type))).toBe(true);
    expect(result.concerns.every((concern) => VALID_CONCERNS.includes(concern))).toBe(true);
  });

  test('defaults to dryness concern and all skin types for sunscreen when no signal exists', () => {
    const product = {
      name: 'Simple SPF',
      description: 'Daily UV protection',
      benefits: [],
      category: 'Sunscreen',
    };

    const result = buildRecommendationFields(product, { preserveExisting: false });

    expect(result.concerns).toContain('dryness');
    expect(result.skinTypes).toEqual(expect.arrayContaining(VALID_SKIN_TYPES));
  });
});