const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'danger', 'success'],
      default: 'info',
    },
    targetRole: {
      type: String,
      enum: ['all', 'passenger', 'officer', 'vendor', 'admin'],
      default: 'all',
    },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date },
    relatedEntity: {
      entityType: { type: String, enum: ['complaint', 'inspection', 'vendor', 'rating'] },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
