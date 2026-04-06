const mongoose = require('mongoose');

const scoreOverrideSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    optionId: {
      type: String,
      required: true,
      trim: true,
    },
    scores: {
      oily: { type: Number, min: 0, default: 0 },
      dry: { type: Number, min: 0, default: 0 },
      sensitive: { type: Number, min: 0, default: 0 },
      acne: { type: Number, min: 0, default: 0 },
    },
  },
  { _id: false }
);

const quizScoringConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: 'default',
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    optionWeightOverrides: {
      type: [scoreOverrideSchema],
      default: [],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QuizScoringConfig', quizScoringConfigSchema);
