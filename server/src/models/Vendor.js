const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stationName: { type: String, required: true },
    trainNumbers: [{ type: String }],
    category: {
      type: String,
      enum: ['pantry', 'platform_stall', 'catering', 'packaged_food'],
      required: true,
    },
    description: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    address: { type: String },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    hygieneScore: { type: Number, default: 0, min: 0, max: 100 },
    lastInspectionDate: { type: Date },
    certifications: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
