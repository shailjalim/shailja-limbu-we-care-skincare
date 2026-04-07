/**
 * RECOMMENDATION ENGINE USAGE EXAMPLES
 * 
 * This file demonstrates how to use the product recommendation engine
 * in both backend and frontend contexts.
 */

// ==================== BACKEND USAGE ====================

/**
 * EXAMPLE 1: Backend - Direct Function Usage
 * (For background jobs, scheduled tasks, or admin operations)
 */

const {
  getRecommendedProducts,
  getDetailedRecommendations,
  calculateProductScore,
} = require('./utils/productRecommendation');

const Product = require('./models/Product');
const SkinProfile = require('./models/SkinProfile');

// Example user profile
const userProfile = {
  skinType: 'oily',
  concerns: ['acne', 'oil control'],
  allergies: ['fragrance', 'alcohol'],
  sensitivityLevel: 'low',
};

// Get recommendations directly
async function backendRecommendationExample() {
  const allProducts = await Product.find();
  
  const recommendations = getRecommendedProducts(userProfile, allProducts, {
    limit: 5,
    groupByCategory: false,
  });

  console.log('Recommended products:', recommendations);
  // Returns: Array of top 5 products sorted by score
}

// ==================== API RESPONSE EXAMPLES ====================

/**
 * SAMPLE API REQUEST & RESPONSES
 */

// REQUEST 1: Get basic recommendations
// GET /api/products/recommendations/personalized
// Headers: Authorization: Bearer {token}

// RESPONSE 1: Basic Recommendations
{
  "success": true,
  "count": 5,
  "userProfile": {
    "skinType": "oily",
    "concerns": ["acne", "oil control"],
    "allergies": ["fragrance", "alcohol"],
    "sensitivityLevel": "low"
  },
  "recommendations": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Cool Clay Cleanser",
      "price": 24.99,
      "description": "Oil-control cleansing clay",
      "category": "Cleanser",
      "ingredients": ["kaolin clay", "salicylic acid", "water"],
      "benefits": ["oil-control", "pore-cleansing"],
      "skinTypes": ["oily", "combination"],
      "concerns": ["acne", "oil control"],
      "image": "https://example.com/image.jpg",
      "recommendationScore": 5  // Best match
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Oil-Free Serum",
      "price": 34.99,
      "description": "Lightweight acne-fighting serum",
      "category": "Serum",
      "ingredients": ["niacinamide", "azelaic acid", "hyaluronic acid"],
      "benefits": ["acne-fighting", "pore-minimizing"],
      "skinTypes": ["oily"],
      "concerns": ["acne"],
      "image": "https://example.com/image.jpg",
      "recommendationScore": 4
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Sebum Control Moisturizer",
      "price": 28.99,
      "description": "Lightweight oil-free moisturizer",
      "category": "Moisturizer",
      "ingredients": ["dimethicone", "glycerin", "water"],
      "benefits": ["oil-control", "hydration"],
      "skinTypes": ["oily", "combination"],
      "concerns": ["oil control"],
      "image": "https://example.com/image.jpg",
      "recommendationScore": 4
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "SPF 50 Sunscreen",
      "price": 22.99,
      "description": "Oil-free daily sunscreen",
      "category": "Sunscreen",
      "ingredients": ["zinc oxide", "octocrylene", "water"],
      "benefits": ["UV protection", "oil-control"],
      "skinTypes": ["oily", "combination"],
      "concerns": [],
      "image": "https://example.com/image.jpg",
      "recommendationScore": 2
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Pore Minimizing Toner",
      "price": 18.99,
      "description": "Alcohol-free pore toner",
      "category": "Toner",
      "ingredients": ["witch hazel extract", "glycerin", "water"],
      "benefits": ["pore-minimizing", "toning"],
      "skinTypes": ["oily", "combination"],
      "concerns": ["acne"],
      "image": "https://example.com/image.jpg",
      "recommendationScore": 3
    }
  ]
}

// ==================== REQUEST 2: Detailed Recommendations ====================
// GET /api/products/recommendations/personalized?detailed=true&limit=3

// RESPONSE 2: Detailed Recommendations with Reasoning
{
  "success": true,
  "count": 3,
  "userProfile": {
    "skinType": "dry",
    "concerns": ["dryness", "aging"],
    "allergies": [],
    "sensitivityLevel": "medium"
  },
  "recommendations": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Hyaluronic Acid Serum",
      "price": 35.99,
      "description": "Ultra-hydrating serum",
      "category": "Serum",
      "ingredients": ["hyaluronic acid", "glycerin", "panthenol"],
      "benefits": ["hydration", "plumping", "anti-aging"],
      "skinTypes": ["dry", "sensitive"],
      "concerns": ["dryness", "aging"],
      "image": "https://example.com/image.jpg",
      "recommendationScore": 6,
      "recommendation": {
        "reason": "Designed for dry skin. Addresses your concerns: dryness, aging",
        "matchPercentage": 100
      }
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Rich Moisturizing Cream",
      "price": 42.99,
      "description": "Nourishing cream for dry skin",
      "category": "Moisturizer",
      "ingredients": ["ceramides", "shea butter", "retinol"],
      "benefits": ["deep hydration", "anti-aging", "barrier repair"],
      "skinTypes": ["dry"],
      "concerns": ["dryness", "aging"],
      "image": "https://example.com/image.jpg",
      "recommendationScore": 6,
      "recommendation": {
        "reason": "Designed for dry skin. Addresses your concerns: dryness, aging",
        "matchPercentage": 100
      }
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Gentle Cream Cleanser",
      "price": 22.99,
      "description": "Non-stripping cream cleanser",
      "category": "Cleanser",
      "ingredients": ["micellar water", "glycerin", "aloe"],
      "benefits": ["gentle cleansing", "hydration"],
      "skinTypes": ["dry", "sensitive"],
      "concerns": ["dryness"],
      "image": "https://example.com/image.jpg",
      "recommendationScore": 3,
      "recommendation": {
        "reason": "Designed for dry skin. Addresses your concerns: dryness",
        "matchPercentage": 67
      }
    }
  ]
}

// ==================== REQUEST 3: Grouped by Category ====================
// GET /api/products/recommendations/personalized?groupByCategory=true&limit=6

// RESPONSE 3: Recommendations Grouped by Category
// (Ensures at least one recommendation per product category)
{
  "success": true,
  "count": 6,
  "userProfile": { /* ... */ },
  "recommendations": [
    // Cleanser - top product from category
    { "category": "Cleanser", "recommendationScore": 4, /* ... */ },
    // Toner - top product from category
    { "category": "Toner", "recommendationScore": 3, /* ... */ },
    // Serum - top product from category
    { "category": "Serum", "recommendationScore": 5, /* ... */ },
    // Moisturizer - top product from category
    { "category": "Moisturizer", "recommendationScore": 4, /* ... */ },
    // Sunscreen - top product from category
    { "category": "Sunscreen", "recommendationScore": 2, /* ... */ },
    // Toner - second product from category (filling remaining slots)
    { "category": "Toner", "recommendationScore": 2, /* ... */ }
  ]
}

// ==================== FRONTEND USAGE ====================

/**
 * REACT COMPONENT: Using Recommendations in Dashboard
 */

import React, { useState, useEffect } from 'react';
import { getRecommendedProducts } from '../services/api';

function RecommendedProductsSection() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await getRecommendedProducts({
          limit: 5,
          groupByCategory: false,
        });
        setRecommendations(response.recommendations);
      } catch (err) {
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="recommended-products">
      <h2>Recommended for Your Skin</h2>
      <div className="products-grid">
        {recommendations.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="category">{product.category}</p>
            <p className="price">${product.price.toFixed(2)}</p>
            
            {/* Recommendation Score Indicator */}
            <div className="score-badge">
              Score: {product.recommendationScore}/6
            </div>

            {/* Show why it's recommended */}
            <p className="match-reasons">
              {product.skinTypes?.includes(product.skinType) && 
                <span className="tag">Matches your skin type</span>}
              {product.concerns?.length > 0 && 
                <span className="tag">Addresses your concerns</span>}
            </p>

            {/* Action Buttons */}
            <button className="btn-primary">View Details</button>
            <button className="btn-secondary">Use in Routine</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== EXAMPLE 2: Routine Builder Integration ====================

/**
 * REACT COMPONENT: Loading recommendations in Routine Tracker
 */

import { getRecommendedProducts } from '../services/api';

function RoutineBuilderWithRecommendations() {
  const [recommendations, setRecommendations] = useState({});
  
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Get recommendations grouped by category
        const response = await getRecommendedProducts({
          limit: 6,
          groupByCategory: true,
        });

        // Organize by category for quick display
        const recByCategory = {};
        response.recommendations.forEach(product => {
          const category = product.category;
          if (!recByCategory[category]) {
            recByCategory[category] = [];
          }
          recByCategory[category].push(product);
        });

        setRecommendations(recByCategory);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      }
    };

    loadRecommendations();
  }, []);

  return (
    <div className="routine-builder">
      {/* Morning Routine */}
      <section className="routine-section">
        <h3>Morning Routine</h3>
        {['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'].map(step => (
          <div key={step} className="routine-step">
            <label>{step}</label>
            <select>
              <option>Select a product</option>
              {recommendations[step]?.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
            
            {/* Show recommended product for this category */}
            {recommendations[step]?.[0] && (
              <div className="suggestion">
                <small>Recommended: {recommendations[step][0].name}</small>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

// ==================== EXAMPLE 3: Filter & Show Detailed Reasoning ====================

import { getDetailedRecommendations } from '../services/api';

async function showDetailedRecommendations() {
  try {
    const response = await getDetailedRecommendations({ limit: 3 });
    
    response.recommendations.forEach(product => {
      console.log(`\n${product.name}:`);
      console.log(`  Score: ${product.recommendationScore}`);
      console.log(`  Reason: ${product.recommendation.reason}`);
      console.log(`  Match: ${product.recommendation.matchPercentage}%`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

// ==================== SCORING CALCULATION EXPLAINED ====================

/**
 * How the Recommendation Score is Calculated:
 * 
 * For each product, we award points:
 * 
 * 1. SKIN TYPE MATCH: +2 points
 *    - If product is recommended for user's skin type
 * 
 * 2. CONCERN MATCH: +2 points per matching concern
 *    - If product addresses user's concerns
 *    - Example: user with "acne" and "oil control" concerns
 *      - Product addressing both = +4 points
 *      - Product addressing only acne = +2 points
 * 
 * 3. BENEFIT BONUS: +1 point
 *    - If product has documented benefits
 * 
 * MAXIMUM SCORE: Product with all matches = 5-6 points
 * 
 * ALLERGEN FILTER: (Critical)
 *    - IF product ingredients contain user allergies
 *    - THEN product is REMOVED from recommendations
 *    - (Never recommended, regardless of score)
 * 
 * EXAMPLE CALCULATION:
 * User Profile:
 *   - skinType: "dry"
 *   - concerns: ["dryness", "aging"]
 *   - allergies: ["fragrance"]
 * 
 * Product A: "Rich Night Cream"
 *   - skinTypes: ["dry", "sensitive"]
 *   - concerns: ["dryness", "aging"]
 *   - ingredients: ["retinol", "ceramides", "shea butter"]
 *   - benefits: ["hydration", "anti-aging"]
 *   Score: 2 (skin match) + 4 (both concerns) + 1 (benefits) = 7 ✓
 * 
 * Product B: "Fragrance-Infused Serum"
 *   - skinTypes: ["dry"]
 *   - concerns: ["dryness"]
 *   - ingredients: ["fragrance", "hyaluronic acid"]
 *   - benefits: ["hydration"]
 *   Score: Would be 2 + 2 + 1 = 5
 *   But: REMOVED due to fragrance allergy ✗
 */

// ==================== ERROR HANDLING ====================

/**
 * Common API Errors & Handling
 */

async function safeGetRecommendations() {
  try {
    const response = await getRecommendedProducts({ limit: 5 });
    return response.recommendations;
  } catch (error) {
    // Handle specific errors
    if (error.response?.status === 404) {
      // User profile doesn't exist - prompt to complete skin quiz
      console.error('Please complete the skin quiz first');
      return null;
    } else if (error.response?.status === 401) {
      // Not authenticated
      console.error('Please log in first');
      return null;
    } else {
      // Server error
      console.error('Failed to load recommendations:', error.message);
      return null;
    }
  }
}

// ==================== TESTING THE RECOMMENDATION ENGINE ====================

/**
 * Mock Data for Testing
 */

const mockProducts = [
  {
    name: 'Gentle Cleanser',
    skinTypes: ['sensitive', 'dry'],
    concerns: ['dryness'],
    ingredients: ['aloe vera', 'water'],
    benefits: ['hydration'],
  },
  {
    name: 'Oil Control Serum',
    skinTypes: ['oily', 'combination'],
    concerns: ['acne', 'oil control'],
    ingredients: ['salicylic acid', 'niacinamide'],
    benefits: ['acne-fighting'],
  },
  {
    name: 'Night Cream with Fragrance',
    skinTypes: ['dry'],
    concerns: ['dryness', 'aging'],
    ingredients: ['retinol', 'fragrance', 'ceramides'],
    benefits: ['anti-aging', 'hydration'],
  },
];

const mockProfile = {
  skinType: 'dry',
  concerns: ['dryness'],
  allergies: ['fragrance'],
  sensitivityLevel: 'high',
};

// Run recommendation
const { getRecommendedProducts } = require('./utils/productRecommendation');
const results = getRecommendedProducts(mockProfile, mockProducts);

console.log('Recommendations:', results);
// Expected: [Gentle Cleanser] only
// Night Cream is excluded due to fragrance allergy
// Oil Control Serum doesn't match dry skin type
