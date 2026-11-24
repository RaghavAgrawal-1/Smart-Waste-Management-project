const mongoose = require('mongoose');

const scrapListingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'ScrapCategory', required: true },
        estimatedWeight: { type: Number, required: true },
        images: [{ type: String }],
        condition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
      },
    ],
    totalEstimatedWeight: { type: Number },
    totalEstimatedValue: { type: Number },
    pickupAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      landmark: { type: String },
    },
    preferredDate: { type: Date },
    preferredTimeSlot: { type: String, enum: ['morning', 'afternoon', 'evening'] },
    additionalNotes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'collected', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScrapListing', scrapListingSchema);
