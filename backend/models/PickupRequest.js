const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'ScrapListing', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledDate: { type: Date },
    timeSlot: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      landmark: { type: String },
    },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'on_the_way', 'arrived', 'scrap_collected', 'completed', 'cancelled'],
      default: 'assigned',
    },
    actualWeight: { type: Number },
    actualValue: { type: Number },
    verificationImages: [{ type: String }],
    agentNotes: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
