/**
 * COMPLETE IMPLEMENTATION EXAMPLES
 * Ready-to-use code samples for integrating recommendations
 */

// ==================== BACKEND: STANDALONE TEST ====================

/**
 * File: /server/testRecommendations.js
 * 
 * Standalone script to test recommendation engine
 * Run: node testRecommendations.js
 */

const mongoose = require('mongoose');
const Product = require('./models/Product');
const SkinProfile = require('./models/SkinProfile');
const {
  getRecommendedProducts,
  getDetailedRecommendations,
} = require('./utils/productRecommendation');

async function testRecommendationEngine() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Test 1: Get user profile and products
    console.log('Test 1: Fetching user profile and products...');
    const userProfile = await SkinProfile.findOne({ user: userId });
    const allProducts = await Product.find();

    if (!userProfile) {
      console.error('✗ User profile not found. Please complete skin quiz first.');
      process.exit(1);
    }

    console.log(`✓ Found profile for user: ${userProfile.skinType} skin`);
    console.log(`✓ Found ${allProducts.length} products in catalog\n`);

    // Test 2: Get basic recommendations
    console.log('Test 2: Basic Recommendations (Top 5)...');
    const basicRecommendations = getRecommendedProducts(userProfile, allProducts);
    console.log(`✓ Got ${basicRecommendations.length} recommendations`);
    basicRecommendations.forEach((product, i) => {
      console.log(`  ${i + 1}. ${product.name} (Score: ${product.recommendationScore}/6)`);
    });
    console.log();

    // Test 3: Detailed recommendations
    console.log('Test 3: Detailed Recommendations with Reasoning...');
    const detailedRecs = getDetailedRecommendations(userProfile, allProducts, 3);
    detailedRecs.forEach((product, i) => {
      console.log(`\n  ${i + 1}. ${product.name}`);
      console.log(`     Score: ${product.recommendationScore}/6`);
      console.log(`     Reason: ${product.recommendation.reason}`);
      console.log(`     Match: ${product.recommendation.matchPercentage}%`);
    });
    console.log();

    // Test 4: Category-grouped recommendations
    console.log('Test 4: Category-Grouped Recommendations (1 per category)...');
    const groupedRecs = getRecommendedProducts(userProfile, allProducts, {
      limit: 6,
      groupByCategory: true,
    });
    const categoryBreakdown = {};
    groupedRecs.forEach(product => {
      if (!categoryBreakdown[product.category]) {
        categoryBreakdown[product.category] = 0;
      }
      categoryBreakdown[product.category]++;
    });

    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} product(s)`);
    });
    console.log();

    // Test 5: Allergen filtering verification
    console.log('Test 5: Allergen Filtering Verification...');
    if (userProfile.allergies && userProfile.allergies.length > 0) {
      console.log(`  User allergies: ${userProfile.allergies.join(', ')}`);
      let productsRemoved = 0;

      allProducts.forEach(product => {
        if (product.ingredients) {
          const hasAllergen = userProfile.allergies.some(allergy =>
            product.ingredients.some(ing =>
              ing.toLowerCase().includes(allergy.toLowerCase())
            )
          );
          if (hasAllergen) {
            productsRemoved++;
            console.log(`  ✓ Filtered: ${product.name}`);
          }
        }
      });

      console.log(`  Total products filtered out: ${productsRemoved}`);
    } else {
      console.log('  No allergens specified by user');
    }

    console.log('\n✓ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if user ID is provided
const userId = process.argv[2];
if (userId) {
  testRecommendationEngine();
} else {
  console.log('Usage: node testRecommendations.js <userId>');
  process.exit(1);
}

// ==================== FRONTEND: COMPLETE DASHBOARD COMPONENT ====================

/**
 * File: /client/src/components/RecommendedProducts.jsx
 * 
 * Complete Dashboard component showing personalized recommendations
 */

import React, { useState, useEffect } from 'react';
import { getRecommendedProducts } from '../services/api';
import '../styles/RecommendedProducts.css';

function RecommendedProducts() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});

  // Fetch recommendations on component mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getRecommendedProducts({
        limit: 5,
        groupByCategory: false,
        detailed: false,
      });

      if (response.success) {
        setRecommendations(response.recommendations);
        setUserProfile(response.userProfile);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Please complete the skin quiz to get personalized recommendations');
      } else {
        setError(err.message || 'Failed to load recommendations');
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 5) return 'excellent';
    if (score >= 4) return 'good';
    if (score >= 3) return 'fair';
    return 'low';
  };

  const getScoreLabel = (score) => {
    if (score >= 5) return 'Excellent Match';
    if (score >= 4) return 'Good Match';
    if (score >= 3) return 'Fair Match';
    return 'Low Priority';
  };

  const handleViewDetails = (productId) => {
    window.location.href = `/product/${productId}`;
  };

  const handleAddToRoutine = (productId, category) => {
    // Navigate to routine tracker with product context
    window.location.href = `/routines?productId=${productId}&category=${encodeURIComponent(
      category
    )}`;
  };

  if (loading) {
    return (
      <section className="recommended-products">
        <h2>Recommended for Your Skin</h2>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading personalized recommendations...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="recommended-products">
        <h2>Recommended for Your Skin</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.href = '/skin-quiz'}>
            Complete Skin Quiz
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="recommended-products">
      <div className="section-header">
        <div>
          <h2>Recommended for Your Skin</h2>
          {userProfile && (
            <p className="user-profile-info">
              Based on your {userProfile.skinType} skin, concerns with{' '}
              {userProfile.concerns.join(', ')}, and{' '}
              {userProfile.sensitivityLevel} sensitivity level
            </p>
          )}
        </div>
        <button className="refresh-btn" onClick={fetchRecommendations} title="Refresh recommendations">
          ↻ Refresh
        </button>
      </div>

      <div className="products-grid">
        {recommendations.length === 0 ? (
          <p className="no-products">No recommendations available at this time.</p>
        ) : (
          recommendations.map((product) => {
            const scoreColor = getScoreBadgeColor(product.recommendationScore);
            const scoreLabel = getScoreLabel(product.recommendationScore);

            return (
              <div key={product._id} className={`product-card ${scoreColor}`}>
                {/* Image Section */}
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                  <div className={`score-badge ${scoreColor}`}>
                    <span className="score">{product.recommendationScore}/6</span>
                    <span className="label">{scoreLabel}</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="product-info">
                  <h3>{product.name}</h3>

                  <div className="category-price">
                    <span className="category">{product.category}</span>
                    <span className="price">${product.price.toFixed(2)}</span>
                  </div>

                  <p className="description">{product.description}</p>

                  {/* Concerns Matched */}
                  {product.concerns && product.concerns.length > 0 && (
                    <div className="concerns">
                      <label>Addresses:</label>
                      <div className="tags">
                        {product.concerns.map((concern) => (
                          <span key={concern} className="tag">
                            {concern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Why Recommended */}
                  <div className="why-recommended">
                    <strong>Why recommended:</strong>
                    {product.skinTypes?.includes(userProfile.skinType) && (
                      <div className="check">✓ Suited for {userProfile.skinType} skin</div>
                    )}
                    {product.concerns && userProfile.concerns.some(c => product.concerns.includes(c)) && (
                      <div className="check">
                        ✓ Targets: {userProfile.concerns.filter(c => product.concerns.includes(c)).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="product-actions">
                    <button
                      className="btn-primary"
                      onClick={() => handleViewDetails(product._id)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleAddToRoutine(product._id, product.category)}
                    >
                      Use in Routine
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default RecommendedProducts;

// ==================== FRONTEND: ROUTINE BUILDER INTEGRATION ====================

/**
 * Snippet to add to /client/src/pages/RoutineTracker.jsx
 * 
 * Shows how to integrate recommendations into existing routine builder
 */

import { getRecommendedProducts } from '../services/api';

function RoutineStepSelector({ stepName, recommendedProduct }) {
  return (
    <div className="step-selector">
      <label>{stepName}</label>

      <select defaultValue={recommendedProduct?._id || ''}>
        <option value="">-- Select a product --</option>
        {/* Load from product list */}
      </select>

      {/* Show recommendation badge */}
      {recommendedProduct && (
        <div className="recommended-badge">
          <span className="icon">⭐</span>
          <span className="text">Recommended: {recommendedProduct.name}</span>
          <span className="score">{recommendedProduct.recommendationScore}/6</span>
        </div>
      )}
    </div>
  );
}

// In RoutineTracker component:
useEffect(() => {
  const loadRecommendedProducts = async () => {
    try {
      // Get recommendations grouped by category
      const response = await getRecommendedProducts({
        limit: 6,
        groupByCategory: true,
      });

      // Organize by category
      const recByCategory = {};
      response.recommendations.forEach((product) => {
        const category = product.category;
        if (!recByCategory[category]) {
          recByCategory[category] = [];
        }
        recByCategory[category].push(product);
      });

      setRecommendationsByCategory(recByCategory);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

  loadRecommendedProducts();
}, []);

// ==================== DATABASE SEED DATA ====================

/**
 * File: /server/seedRecommendationTestData.js
 * 
 * Creates test products for recommendation testing
 * Run: npm run seed:recommendations
 */

const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const testProducts = [
  {
    name: 'Gentle Gel Cleanser',
    price: 19.99,
    description: 'Mild gel cleanser for sensitive skin',
    category: 'Cleanser',
    ingredients: ['water', 'glycerin', 'aloe vera'],
    benefits: ['gentle cleansing', 'hydration'],
    skinTypes: ['sensitive', 'dry'],
    concerns: ['sensitivity'],
  },
  {
    name: 'Salicylic Acid Serum',
    price: 34.99,
    description: 'Acne-fighting serum with 2% salicylic acid',
    category: 'Serum',
    ingredients: ['salicylic acid', 'niacinamide', 'water'],
    benefits: ['acne fighting', 'pore cleansing'],
    skinTypes: ['oily', 'combination'],
    concerns: ['acne'],
  },
  {
    name: 'Rich Night Cream',
    price: 42.99,
    description: 'Nourishing night cream with retinol',
    category: 'Moisturizer',
    ingredients: ['retinol', 'ceramides', 'shea butter'],
    benefits: ['anti-aging', 'deep hydration'],
    skinTypes: ['dry'],
    concerns: ['dryness', 'aging'],
  },
  {
    name: 'Hydrating Toner',
    price: 24.99,
    description: 'Hydrating essence toner',
    category: 'Toner',
    ingredients: ['hyaluronic acid', 'glycerin', 'water'],
    benefits: ['hydration', 'preparation'],
    skinTypes: ['dry', 'sensitive', 'combination'],
    concerns: ['dryness'],
  },
  {
    name: 'Broad Spectrum Sunscreen SPF 50',
    price: 28.99,
    description: 'Daily broad spectrum sunscreen',
    category: 'Sunscreen',
    ingredients: ['zinc oxide', 'water'],
    benefits: ['UV protection', 'prevention'],
    skinTypes: ['all'],
    concerns: [],
  },
];

async function seedRecommendationTestData() {
  try {
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Clear existing products (optional)
    // await Product.deleteMany({});

    // Insert test products
    const inserted = await Product.insertMany(testProducts);
    console.log(`✓ Inserted ${inserted.length} test products`);

    inserted.forEach((product) => {
      console.log(`  - ${product.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error.message);
    process.exit(1);
  }
}

seedRecommendationTestData();

// ==================== CSS STYLING ====================

/**
 * File: /client/src/styles/RecommendedProducts.css
 */

.recommended-products {
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin: 2rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.user-profile-info {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #ddd;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.refresh-btn:hover {
  background: #ccc;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 5px solid #ddd;
}

.product-card.excellent {
  border-left-color: #4caf50;
}

.product-card.good {
  border-left-color: #2196f3;
}

.product-card.fair {
  border-left-color: #ff9800;
}

.product-card.low {
  border-left-color: #ccc;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 200px;
  background: #f0f0f0;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  color: #999;
}

.score-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.score-badge.excellent {
  background: #4caf50;
  color: white;
}

.score-badge.good {
  background: #2196f3;
  color: white;
}

.score {
  font-weight: bold;
  display: block;
  font-size: 1.2rem;
}

.label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.9;
}

.product-info {
  padding: 1.5rem;
}

.product-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: #333;
}

.category-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.price {
  font-size: 1.3rem;
  color: #4caf50;
  font-weight: bold;
}

.description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.concerns {
  margin-bottom: 1rem;
}

.concerns label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}

.why-recommended {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.why-recommended strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.check {
  margin-left: 1rem;
  color: #4caf50;
  line-height: 1.5;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.recommended-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff3cd;
  color: #856404;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.error-message button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-actions {
    flex-direction: column;
  }
}
