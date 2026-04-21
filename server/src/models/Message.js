const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['admin', 'officer', 'passenger', 'vendor'], required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverRole: { type: String, enum: ['admin', 'officer', 'passenger', 'vendor'], required: true },
    content: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    // Sorted pair of user IDs for fast conversation lookup
    conversationId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
