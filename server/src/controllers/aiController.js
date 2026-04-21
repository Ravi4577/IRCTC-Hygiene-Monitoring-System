const AiInsight = require('../models/AiInsight');
const { analyzeSentiment, extractKeywords } = require('../services/aiService');

// @desc    Analyze text sentiment
// @route   POST /api/ai/analyze
const analyzeText = async (req, res, next) => {
  try {
    const { text, sourceType, sourceId } = req.body;

    const sentiment = await analyzeSentiment(text);
    const keywords = extractKeywords(text);

    // Save insight if source provided
    let insight = null;
    if (sourceType && sourceId) {
      insight = await AiInsight.create({
        sourceType, sourceId, text, sentiment, keywords,
        processedAt: new Date(),
      });
    }

    res.json({ success: true, sentiment, keywords, insight });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI insights
// @route   GET /api/ai/insights
const getInsights = async (req, res, next) => {
  try {
    const { sourceType, page = 1, limit = 20 } = req.query;
    const filter = sourceType ? { sourceType } : {};

    const insights = await AiInsight.find(filter)
      .sort('-processedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AiInsight.countDocuments(filter);
    res.json({ success: true, total, insights });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeText, getInsights };
