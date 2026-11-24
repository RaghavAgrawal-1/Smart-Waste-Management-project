const mongoose = require('mongoose');

const scrapCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    image: { type: String },
    pricePerKg: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    acceptedMaterials: [{ type: String }],
    conditionRequirements: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScrapCategory', scrapCategorySchema);
