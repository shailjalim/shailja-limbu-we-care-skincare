/**
 * Product Recommendation Engine
 * Recommends skincare products based on user profile
 */

/**
 * Calculate recommendation score for a product
 * @param {Object} userProfile - User's skin profile {skinType, concerns, allergies, sensitivityLevel}
 * @param {Object} product - Product from database
 * @returns {number} Score for the product
 */
const calculateProductScore = (userProfile, product) => {
  let score = 0;

  // +2 if skinType matches
  if (product.skinTypes && product.skinTypes.includes(userProfile.skinType)) {
    score += 2;
  }

  // +2 for each matching concern
  if (product.concerns && userProfile.concerns) {
    const matchingConcerns = product.concerns.filter(concern =>
      userProfile.concerns.includes(concern)
    );
    score += matchingConcerns.length * 2;
  }

  // +1 if product benefits match user goals (if available)
  // (This can be extended if user goals are added to profile)
  if (product.benefits && product.benefits.length > 0) {
    score += 1;
  }

  return score;
};

/**
 * Check if product contains any user allergies
 * @param {Array} productIngredients - Product ingredients
 * @param {Array} userAllergies - User allergies
 * @returns {boolean} True if product contains allergies
 */
const containsAllergens = (productIngredients = [], userAllergies = []) => {
  if (!userAllergies || userAllergies.length === 0) {
    return false;
  }

  return productIngredients.some(ingredient =>
    userAllergies.some(allergy =>
      ingredient.toLowerCase().includes(allergy.toLowerCase())
    )
  );
};

/**
 * Get recommended products for a user
 * @param {Object} userProfile - User's skin profile {skinType, concerns, allergies, sensitivityLevel}
 * @param {Array} allProducts - All products from database
 * @param {Object} options - Additional options {limit: 5, groupByCategory: false}
 * @returns {Array} Recommended products sorted by score
 */
const getRecommendedProducts = (userProfile, allProducts, options = {}) => {
  const { limit = 5, groupByCategory = false } = options;

  if (!userProfile || !allProducts || !Array.isArray(allProducts)) {
    return [];
  }

  // Step 1: Filter by skinType
  let filtered = allProducts.filter(product =>
    product.skinTypes && product.skinTypes.includes(userProfile.skinType)
  );

  // Step 2: Match concerns (keep products with at least one matching concern)
  if (userProfile.concerns && userProfile.concerns.length > 0) {
    filtered = filtered.filter(product =>
      product.concerns &&
      product.concerns.some(concern => userProfile.concerns.includes(concern))
    );
  }

  // Step 3: Exclude allergies (VERY IMPORTANT)
  filtered = filtered.filter(product =>
    !containsAllergens(product.ingredients, userProfile.allergies)
  );

  // Step 4: Score and sort
  const scored = filtered.map(product => ({
    ...product.toObject ? product.toObject() : product,
    recommendationScore: calculateProductScore(userProfile, product),
  }));

  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Step 5: Group by category (optional)
  if (groupByCategory) {
    return groupProductsByCategory(scored, limit);
  }

  // Return top N products
  return scored.slice(0, limit);
};

/**
 * Group products by category with at least one per category
 * @param {Array} products - Scored and sorted products
 * @param {number} totalLimit - Maximum total products to return
 * @returns {Array} Products grouped and limited
 */
const groupProductsByCategory = (products, totalLimit = 5) => {
  const categoryMap = new Map();
  const result = [];

  // Group by category
  products.forEach(product => {
    const category = product.category || 'General';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category).push(product);
  });

  // Ensure at least one product per category
  const categories = Array.from(categoryMap.keys());

  // First pass: add top product from each category
  categories.forEach(category => {
    if (result.length < totalLimit && categoryMap.get(category).length > 0) {
      result.push(categoryMap.get(category)[0]);
    }
  });

  // Second pass: fill remaining slots with next best products
  categories.forEach(category => {
    if (result.length >= totalLimit) return;

    const categoryProducts = categoryMap.get(category);
    for (let i = 1; i < categoryProducts.length; i++) {
      if (result.length < totalLimit) {
        result.push(categoryProducts[i]);
      } else {
        break;
      }
    }
  });

  return result.slice(0, totalLimit);
};

/**
 * Get detailed recommendation with reasoning
 * @param {Object} userProfile - User's skin profile
 * @param {Array} allProducts - All products
 * @param {number} limit - Max products to return
 * @returns {Array} Products with reasoning
 */
const getDetailedRecommendations = (userProfile, allProducts, limit = 5) => {
  const recommendations = getRecommendedProducts(userProfile, allProducts, {
    limit,
    groupByCategory: false,
  });

  return recommendations.map(product => ({
    ...product,
    recommendation: {
      reason: generateRecommendationReason(userProfile, product),
      matchPercentage: calculateMatchPercentage(userProfile, product),
    },
  }));
};

/**
 * Generate human-readable recommendation reason
 * @param {Object} userProfile - User profile
 * @param {Object} product - Product
 * @returns {string} Reason text
 */
const generateRecommendationReason = (userProfile, product) => {
  const reasons = [];

  if (product.skinTypes && product.skinTypes.includes(userProfile.skinType)) {
    reasons.push(`Designed for ${userProfile.skinType} skin`);
  }

  if (product.concerns && userProfile.concerns) {
    const matches = product.concerns.filter(c => userProfile.concerns.includes(c));
    if (matches.length > 0) {
      reasons.push(`Addresses your concerns: ${matches.join(', ')}`);
    }
  }

  return reasons.length > 0 ? reasons.join('. ') : 'Good match for your profile';
};

/**
 * Calculate match percentage
 * @param {Object} userProfile - User profile
 * @param {Object} product - Product
 * @returns {number} Match percentage 0-100
 */
const calculateMatchPercentage = (userProfile, product) => {
  let matches = 0;
  let total = 0;

  // Skin type match
  total += 1;
  if (product.skinTypes && product.skinTypes.includes(userProfile.skinType)) {
    matches += 1;
  }

  // Concerns match
  if (userProfile.concerns && userProfile.concerns.length > 0) {
    total += 1;
    if (product.concerns && userProfile.concerns.some(c => product.concerns.includes(c))) {
      matches += 1;
    }
  }

  // No allergens
  total += 1;
  if (!containsAllergens(product.ingredients, userProfile.allergies)) {
    matches += 1;
  }

  return Math.round((matches / total) * 100);
};

module.exports = {
  getRecommendedProducts,
  getDetailedRecommendations,
  calculateProductScore,
  containsAllergens,
  groupProductsByCategory,
  generateRecommendationReason,
  calculateMatchPercentage,
};
