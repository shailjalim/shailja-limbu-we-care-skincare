const mongoose = require('mongoose');

const VALID_CATEGORIES = ['acne', 'dryness', 'oily', 'sensitive', 'general'];

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: VALID_CATEGORIES,
      required: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

contentSchema.index({ category: 1 });
contentSchema.index({ tags: 1 });

module.exports = mongoose.model('Content', contentSchema);