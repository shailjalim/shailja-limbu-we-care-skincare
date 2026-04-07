const normalize = (value) => String(value || '').trim().toLowerCase();

const SKIN_TYPE_TO_CATEGORY = {
  oily: 'oily',
  dry: 'dryness',
  sensitive: 'sensitive',
  combination: 'general',
  normal: 'general',
};

const scoreContent = (userProfile, item) => {
  let score = 0;

  const concernMatches = (userProfile?.concerns || [])
    .map(normalize)
    .filter(Boolean)
    .filter((concern) => (item.tags || []).map(normalize).includes(concern));

  score += concernMatches.length * 3;

  const targetCategory = SKIN_TYPE_TO_CATEGORY[normalize(userProfile?.skinType)] || 'general';
  if (normalize(item.category) === targetCategory) {
    score += 4;
  }

  if (normalize(item.category) === 'general') {
    score += 1;
  }

  return score;
};

const getRecommendedContent = (userProfile, contentList, options = {}) => {
  const { limit = 5 } = options;

  if (!Array.isArray(contentList) || !userProfile) {
    return [];
  }

  return contentList
    .map((item) => ({
      ...(item.toObject ? item.toObject() : item),
      relevanceScore: scoreContent(userProfile, item),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
};

module.exports = {
  getRecommendedContent,
};