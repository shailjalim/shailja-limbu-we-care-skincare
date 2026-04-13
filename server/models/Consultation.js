const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    // Canonical field requested for consultation owner.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Legacy compatibility for older documents/controllers.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    images: { type: [String], default: [] },
    profileSnapshot: {
      skinType: { type: String, default: '' },
      concerns: { type: [String], default: [] },
      allergies: { type: [String], default: [] },
      sensitivityLevel: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    adminReply: { type: String, trim: true, maxlength: 2000, default: '' },
    adminReplyImages: { type: [String], default: [] },
    // Legacy compatibility for older records/routes.
    concern: { type: String },
    details: { type: String },
    response: { type: String },
    requestedAt: { type: Date },
    respondedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Consultation', consultationSchema);
