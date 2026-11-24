const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupRequest' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    isResolved: { type: Boolean, default: false },
    adminResponse: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
