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
  const concernTags = (userProfile?.concerns || []).map(normalize).filter(Boolean);
  const contentTags = (item.tags || []).map(normalize).filter(Boolean);

  concernTags.forEach((concern) => {
    if (contentTags.includes(concern)) {
      score += 3;
    }
  });

  const targetCategory = SKIN_TYPE_TO_CATEGORY[normalize(userProfile?.skinType)] || 'general';
  if (normalize(item.category) === targetCategory) {
    score += 4;
  }

  if (normalize(item.category) === 'general') {
    score += 1;
  }

  return score;
};

export const getRecommendedContent = (userProfile, contentList, options = {}) => {
  const { limit = 5 } = options;

  if (!userProfile || !Array.isArray(contentList)) {
    return [];
  }

  return contentList
    .map((item) => ({
      ...(item || {}),
      relevanceScore: scoreContent(userProfile, item),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
};