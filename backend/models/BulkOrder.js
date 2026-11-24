const mongoose = require('mongoose');

const bulkOrderSchema = new mongoose.Schema(
  {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'RecyclingPartner', required: true },
    categories: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'ScrapCategory' },
        quantity: { type: Number },
        pricePerKg: { type: Number },
      },
    ],
    totalValue: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'approved', 'dispatched', 'completed'],
      default: 'pending',
    },
    dispatchDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BulkOrder', bulkOrderSchema);
