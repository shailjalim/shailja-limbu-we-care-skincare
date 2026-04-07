const Product = require('../models/Product');
const SkinProfile = require('../models/SkinProfile');
const {
  getRecommendedProducts,
  getDetailedRecommendations,
} = require('../utils/productRecommendation');

// Get all products with optional search/filter
exports.getProducts = async (req, res) => {
  try {
    const { search, ingredient, category, skinType, concern } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (ingredient) {
      query.ingredients = { $in: [ingredient] };
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (skinType) {
      query.skinTypes = { $in: [String(skinType).toLowerCase()] };
    }

    if (concern) {
      query.concerns = { $in: [String(concern).toLowerCase()] };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: Add new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Invalid product data' });
  }
};

// Admin: Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Invalid product data' });
  }
};

// Admin: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get recommended products for authenticated user
exports.getRecommendedProducts = async (req, res) => {
  try {
    // Get user ID from auth token (from authMiddleware)
    const userId = req.user.id;
    const { limit = 5, groupByCategory = false, detailed = false } = req.query;

    // Fetch user's skin profile
    const userProfile = await SkinProfile.findOne({ user: userId });
    if (!userProfile) {
      return res.status(404).json({
        error: 'User profile not found. Please complete the skin quiz first.',
      });
    }

    // Fetch all products
    const allProducts = await Product.find();

    // Get recommendations using appropriate function
    let recommendations;
    if (detailed === 'true') {
      recommendations = getDetailedRecommendations(
        userProfile,
        allProducts,
        parseInt(limit) || 5
      );
    } else {
      recommendations = getRecommendedProducts(
        userProfile,
        allProducts,
        {
          limit: parseInt(limit) || 5,
          groupByCategory: groupByCategory === 'true',
        }
      );
    }

    res.json({
      success: true,
      count: recommendations.length,
      userProfile: {
        skinType: userProfile.skinType,
        concerns: userProfile.concerns,
        allergies: userProfile.allergies,
        sensitivityLevel: userProfile.sensitivityLevel,
      },
      recommendations,
    });
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Server error retrieving recommendations' });
  }
};
