const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  ingredients: [String],
  benefits: [String],
  image: { type: String }, // URL or path
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);