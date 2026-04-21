const { getGeminiReply } = require('../services/geminiService');

const FALLBACK_MESSAGE =
  "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or contact support through the Messages section.";

// @desc    Send message — powered by Google Gemini
// @route   POST /api/chatbot/message
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let reply;
    let source = 'gemini';

    try {
      reply = await getGeminiReply(message.trim(), history);
    } catch (err) {
      // Log the real error server-side but never expose it to the client
      console.error('[Chatbot] Gemini error:', err.message);
      reply = FALLBACK_MESSAGE;
      source = 'fallback';
    }

    res.json({ success: true, reply, source, timestamp: new Date() });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage };
