const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    refId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    plan: {
      type: String,
      enum: ['monthly', 'half-yearly', 'yearly'],
      required: true,
    },
    gateway: {
      type: String,
      enum: ['esewa'],
      default: 'esewa',
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
      index: true,
    },
    verificationRaw: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
