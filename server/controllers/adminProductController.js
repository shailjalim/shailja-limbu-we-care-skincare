const Product = require('../models/Product');
const { buildRecommendationFields, VALID_CONCERNS, VALID_SKIN_TYPES } = require('../utils/productRecommendationFields');

const VALID_CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'General'];

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const normalizeLowerArray = (value) => normalizeArray(value).map((item) => item.toLowerCase());

const normalizeCategory = (value) => {
  const category = String(value || '').trim();
  const matchedCategory = VALID_CATEGORIES.find((item) => item.toLowerCase() === category.toLowerCase());
  return matchedCategory || 'General';
};

const normalizeAllowedValues = (value, allowedValues) => {
  const allowedSet = new Set(allowedValues);
  return normalizeLowerArray(value).filter((item) => allowedSet.has(item));
};

const mapProductPayload = (body = {}) => {
  const skinTypeInput = body.skinTypes || body.skinType || [];
  const explicitConcerns = normalizeAllowedValues(body.concerns, VALID_CONCERNS);
  const explicitSkinTypes = normalizeAllowedValues(skinTypeInput, VALID_SKIN_TYPES);
  const baseProduct = {
    name: body.name,
    description: body.description,
    category: normalizeCategory(body.category),
    benefits: normalizeArray(body.benefits),
  };
  const inferredFields = buildRecommendationFields(baseProduct, { preserveExisting: false });

  return {
    name: body.name,
    description: body.description,
    price: Number(body.price),
    category: normalizeCategory(body.category),
    skinTypes: explicitSkinTypes.length > 0 ? explicitSkinTypes : inferredFields.skinTypes,
    concerns: explicitConcerns.length > 0 ? explicitConcerns : inferredFields.concerns,
    ingredients: normalizeArray(body.ingredients),
    benefits: baseProduct.benefits,
    image: body.imageUrl || body.image,
  };
};

exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching products' });
  }
};

exports.createAdminProduct = async (req, res) => {
  try {
    const payload = mapProductPayload(req.body);
    if (!payload.name || !payload.description || Number.isNaN(payload.price)) {
      return res.status(400).json({ success: false, message: 'name, description and valid price are required' });
    }

    const product = await Product.create(payload);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.name === 'ValidationError' ? error.message : 'Invalid product data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.updateAdminProduct = async (req, res) => {
  try {
    const payload = mapProductPayload(req.body);
    if (req.body.price !== undefined && Number.isNaN(payload.price)) {
      return res.status(400).json({ success: false, message: 'price must be a valid number' });
    }

    const updateData = {
      ...(req.body.name !== undefined ? { name: payload.name } : {}),
      ...(req.body.description !== undefined ? { description: payload.description } : {}),
      ...(req.body.price !== undefined ? { price: payload.price } : {}),
      ...(req.body.category !== undefined ? { category: payload.category } : {}),
      ...(req.body.skinType !== undefined || req.body.skinTypes !== undefined ? { skinTypes: payload.skinTypes } : {}),
      ...(req.body.concerns !== undefined ? { concerns: payload.concerns } : {}),
      ...(req.body.ingredients !== undefined ? { ingredients: payload.ingredients } : {}),
      ...(req.body.benefits !== undefined ? { benefits: payload.benefits } : {}),
      ...(req.body.imageUrl !== undefined || req.body.image !== undefined ? { image: payload.image } : {}),
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.name === 'ValidationError' ? error.message : 'Invalid product data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while deleting product' });
  }
};