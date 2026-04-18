const mongoose = require('mongoose');

const VALID_CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'General'];
const VALID_SKIN_TYPES = ['oily', 'dry', 'combination', 'sensitive', 'normal'];
const VALID_CONCERNS = ['acne', 'dryness', 'oil control', 'sensitivity', 'pigmentation', 'aging'];

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: VALID_CATEGORIES,
    default: 'General',
  },
  ingredients: {
    type: [String],
    default: [],
  },
  benefits: {
    type: [String],
    default: [],
  },
  skinTypes: {
    type: [
      {
        type: String,
        enum: VALID_SKIN_TYPES,
        lowercase: true,
        trim: true,
      },
    ],
    default: [],
  },
  concerns: {
    type: [
      {
        type: String,
        enum: VALID_CONCERNS,
        lowercase: true,
        trim: true,
      },
    ],
    default: [],
  },
  image: { type: String }, // URL or path
}, {
  timestamps: true,
});

productSchema.index({ category: 1 });
productSchema.index({ concerns: 1 });

module.exports = mongoose.model('Product', productSchema);