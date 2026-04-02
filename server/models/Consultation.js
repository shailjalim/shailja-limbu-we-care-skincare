const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  concern: { type: String, required: true },
  details: { type: String },
  status: { type: String, enum: ['pending', 'in-review', 'completed'], default: 'pending' },
  response: { type: String },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
});

module.exports = mongoose.model('Consultation', consultationSchema);
