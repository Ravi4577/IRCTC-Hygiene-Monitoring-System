const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    overall: { type: Number, required: true, min: 1, max: 5 },
    foodQuality: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    review: { type: String, maxlength: 500 },
    pnrNumber: { type: String },
    trainNumber: { type: String },
    images: [{ type: String }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One rating per user per vendor
ratingSchema.index({ vendor: 1, ratedBy: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
