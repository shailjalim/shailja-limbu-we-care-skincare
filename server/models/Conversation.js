/**
 * Conversation Model
 * 
 * Stores chat conversations per user with embedded messages and timestamps.
 * One conversation per user (unique user reference).
 * Messages include role, content, and timestamp.
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    messages: [messageSchema],
    skinProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkinProfile',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
