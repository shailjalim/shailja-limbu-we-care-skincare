const {
  calculateProductScore,
  containsAllergens,
  getDetailedRecommendations,
  getRecommendedProducts,
  groupProductsByCategory,
  generateRecommendationReason,
  calculateMatchPercentage,
} = require('../../utils/productRecommendation');

describe('productRecommendation', () => {
  const userProfile = {
    skinType: 'oily',
    concerns: ['acne', 'blackheads'],
    allergies: ['fragrance'],
  };

  test('calculateProductScore rewards matching skin type, concerns, and benefits', () => {
    const score = calculateProductScore(userProfile, {
      skinTypes: ['oily'],
      concerns: ['acne', 'redness'],
      benefits: ['oil control'],
    });

    expect(score).toBe(5);
  });

  test('containsAllergens matches ingredient names case-insensitively', () => {
    expect(containsAllergens(['Water', 'Fragrance'], ['fragrance'])).toBe(true);
    expect(containsAllergens(['Water', 'Niacinamide'], ['fragrance'])).toBe(false);
  });

  test('getRecommendedProducts filters, scores, and sorts valid products', () => {
    const products = [
      {
        name: 'Match A',
        skinTypes: ['oily'],
        concerns: ['acne'],
        ingredients: ['water'],
        benefits: ['calming'],
        category: 'Cleanser',
      },
      {
        name: 'Filtered by allergy',
        skinTypes: ['oily'],
        concerns: ['acne'],
        ingredients: ['fragrance'],
        benefits: ['calming'],
        category: 'Serum',
      },
      {
        name: 'Best match',
        skinTypes: ['oily'],
        concerns: ['acne', 'blackheads'],
        ingredients: ['water'],
        benefits: ['calming'],
        category: 'Moisturizer',
      },
      {
        name: 'Wrong skin type',
        skinTypes: ['dry'],
        concerns: ['acne'],
        ingredients: ['water'],
        benefits: ['calming'],
        category: 'Toner',
      },
    ];

    const recommendations = getRecommendedProducts(userProfile, products, { limit: 3 });

    expect(recommendations).toHaveLength(2);
    expect(recommendations.map((product) => product.name)).toEqual(['Best match', 'Match A']);
    expect(recommendations[0].recommendationScore).toBeGreaterThan(recommendations[1].recommendationScore);
  });

  test('groupProductsByCategory keeps one item per category before filling remaining slots', () => {
    const products = [
      { name: 'A1', category: 'Cleanser', recommendationScore: 7 },
      { name: 'A2', category: 'Cleanser', recommendationScore: 6 },
      { name: 'B1', category: 'Serum', recommendationScore: 5 },
      { name: 'C1', category: 'Moisturizer', recommendationScore: 4 },
    ];

    expect(groupProductsByCategory(products, 3).map((product) => product.name)).toEqual(['A1', 'B1', 'C1']);
  });

  test('detailed recommendations include reason and match percentage', () => {
    const product = {
      name: 'Oil Control Cleanser',
      skinTypes: ['oily'],
      concerns: ['acne'],
      ingredients: ['water'],
      benefits: ['clarifying'],
    };

    expect(generateRecommendationReason(userProfile, product)).toContain('Designed for oily skin');
    expect(calculateMatchPercentage(userProfile, product)).toBe(100);

    const detailed = getDetailedRecommendations(userProfile, [product], 1);
    expect(detailed[0]).toMatchObject({
      name: 'Oil Control Cleanser',
      recommendation: {
        reason: expect.any(String),
        matchPercentage: 100,
      },
    });
  });

  test('returns fallback reason when no explicit match text is found', () => {
    const reason = generateRecommendationReason(
      { skinType: 'normal', concerns: [] },
      { skinTypes: ['oily'], concerns: ['acne'] }
    );

    expect(reason).toBe('Good match for your profile');
  });

  test('getRecommendedProducts supports groupByCategory mode', () => {
    const products = [
      {
        name: 'Cleanser Top',
        skinTypes: ['oily'],
        concerns: ['acne'],
        ingredients: ['water'],
        benefits: ['calming'],
        category: 'Cleanser',
      },
      {
        name: 'Serum Top',
        skinTypes: ['oily'],
        concerns: ['blackheads'],
        ingredients: ['water'],
        benefits: ['calming'],
        category: 'Serum',
      },
      {
        name: 'Serum Extra',
        skinTypes: ['oily'],
        concerns: ['blackheads'],
        ingredients: ['water'],
        benefits: ['calming'],
        category: 'Serum',
      },
    ];

    const recommendations = getRecommendedProducts(userProfile, products, {
      limit: 2,
      groupByCategory: true,
    });

    expect(recommendations).toHaveLength(2);
    expect(recommendations.map((item) => item.category)).toEqual(expect.arrayContaining(['Cleanser', 'Serum']));
  });
});