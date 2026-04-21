const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      enum: ['complaint', 'rating', 'review'],
      required: true,
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    sentiment: {
      label: { type: String, enum: ['positive', 'neutral', 'negative'] },
      score: { type: Number, min: -1, max: 1 },
      confidence: { type: Number, min: 0, max: 1 },
    },
    keywords: [{ type: String }],
    categories: [{ type: String }],
    summary: { type: String },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AiInsight', aiInsightSchema);
