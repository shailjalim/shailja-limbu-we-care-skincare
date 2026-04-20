const { getRecommendedContent } = require('../../utils/contentRecommendation');

describe('contentRecommendation', () => {
  const userProfile = {
    skinType: 'oily',
    concerns: ['acne', 'sensitivity'],
  };

  test('returns an empty array for invalid inputs', () => {
    expect(getRecommendedContent(null, [])).toEqual([]);
    expect(getRecommendedContent(userProfile, null)).toEqual([]);
  });

  test('scores content by concern match, category match, and general fallback', () => {
    const contentList = [
      {
        title: 'Best match',
        category: 'oily',
        tags: ['acne'],
      },
      {
        title: 'General guide',
        category: 'general',
        tags: ['acne'],
      },
      {
        title: 'Unrelated guide',
        category: 'dryness',
        tags: ['hydration'],
      },
    ];

    const recommendations = getRecommendedContent(userProfile, contentList, { limit: 3 });

    expect(recommendations.map((item) => item.title)).toEqual(['Best match', 'General guide', 'Unrelated guide']);
    expect(recommendations[0].relevanceScore).toBeGreaterThan(recommendations[1].relevanceScore);
    expect(recommendations[1].relevanceScore).toBeGreaterThan(recommendations[2].relevanceScore);
  });

  test('respects the requested limit and supports mongoose-like toObject items', () => {
    const contentList = [
      {
        toObject: () => ({ title: 'First', category: 'general', tags: ['acne'] }),
      },
      {
        title: 'Second',
        category: 'general',
        tags: ['acne'],
      },
    ];

    const recommendations = getRecommendedContent(userProfile, contentList, { limit: 1 });

    expect(recommendations).toHaveLength(1);
    expect(['First', 'Second']).toContain(recommendations[0].title);
    expect(recommendations[0].relevanceScore).toBeGreaterThan(0);
  });
});