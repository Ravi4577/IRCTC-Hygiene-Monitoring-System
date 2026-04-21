const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['food_quality', 'cleanliness', 'service', 'pricing', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    trainNumber: { type: String },
    stationName: { type: String },
    pnrNumber: { type: String },
    images: [{ type: String }],
    resolution: { type: String },
    resolvedAt: { type: Date },
    // AI sentiment analysis result
    sentiment: {
      label: { type: String, enum: ['positive', 'neutral', 'negative'] },
      score: { type: Number },
    },
    statusHistory: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
