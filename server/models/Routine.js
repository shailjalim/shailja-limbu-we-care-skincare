const mongoose = require('mongoose');

const VALID_ROUTINE_TYPES = ['morning', 'night'];
const VALID_STEP_NAMES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'];

const stepSchema = new mongoose.Schema({
  step_name: {
    type: String,
    required: true,
    enum: VALID_STEP_NAMES,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const routineSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  routine_type: {
    type: String,
    enum: VALID_ROUTINE_TYPES,
    required: true,
  },
  steps: {
    type: [stepSchema],
    default: [],
    validate: [
      {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one routine step is required',
      },
      {
        validator: (v) => {
          const stepNames = v.map((step) => step.step_name);
          return new Set(stepNames).size === stepNames.length;
        },
        message: 'Step names must be unique within a routine',
      },
    ],
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);
