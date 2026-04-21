const mongoose = require('mongoose');

const pnrVerificationSchema = new mongoose.Schema(
  {
    pnrNumber: { type: String, required: true },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trainNumber: { type: String },
    trainName: { type: String },
    journeyDate: { type: Date },
    fromStation: { type: String },
    toStation: { type: String },
    passengerName: { type: String },
    seatClass: { type: String },
    status: { type: String, enum: ['confirmed', 'waitlisted', 'cancelled', 'invalid'] },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PnrVerification', pnrVerificationSchema);
