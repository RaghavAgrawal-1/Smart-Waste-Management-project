const mongoose = require('mongoose');

const recyclingPartnerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    acceptedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScrapCategory' }],
    isVerified: { type: Boolean, default: false },
    purchaseRates: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'ScrapCategory' },
        ratePerKg: { type: Number },
      },
    ],
    documents: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecyclingPartner', recyclingPartnerSchema);
