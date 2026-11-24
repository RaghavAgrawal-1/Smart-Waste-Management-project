const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupRequest' },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    paymentMethod: { type: String, enum: ['upi', 'bank_transfer', 'wallet'] },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    referenceId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
