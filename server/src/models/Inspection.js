const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: ['routine', 'surprise', 'follow_up', 'complaint_based'],
      default: 'routine',
    },
    stationName: { type: String },
    // Checklist scores (0-10 each)
    checklist: {
      foodStorage: { type: Number, min: 0, max: 10 },
      cookingArea: { type: Number, min: 0, max: 10 },
      servingArea: { type: Number, min: 0, max: 10 },
      staffHygiene: { type: Number, min: 0, max: 10 },
      wasteManagement: { type: Number, min: 0, max: 10 },
      pestControl: { type: Number, min: 0, max: 10 },
      waterQuality: { type: Number, min: 0, max: 10 },
      documentation: { type: Number, min: 0, max: 10 },
    },
    overallScore: { type: Number, min: 0, max: 100 },
    grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F'] },
    findings: { type: String },
    recommendations: { type: String },
    images: [{ type: String }],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    relatedComplaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inspection', inspectionSchema);
