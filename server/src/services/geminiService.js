const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_INSTRUCTION = `You are a helpful passenger support assistant for the IRCTC Hygiene Rating and Monitoring System — an Indian Railways food hygiene complaint and monitoring platform.

You help passengers with:
- Filing hygiene complaints about food vendors on trains and stations
- Tracking complaint status (Pending, In Progress, Resolved, Rejected)
- Verifying PNR numbers
- Rating and reviewing food vendors
- Understanding hygiene scores and inspection results
- Navigating platform features

Rules:
- Keep answers concise and helpful (3-5 sentences max)
- Be friendly, clear, and professional
- Use numbered steps when explaining how to do something
- If asked something unrelated to this platform, politely say you can only help with IRCTC Hygiene platform topics
- Always encourage passengers to report hygiene issues`;

/**
 * Build a fresh Gemini model instance using the current env key.
 * Called on every request so key changes in .env are picked up without restart.
 */
const buildModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());

  return genAI.getGenerativeModel({
    model: (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim(),
    systemInstruction: SYSTEM_INSTRUCTION,
  });
};

/**
 * Send a message to Gemini and return the text reply.
 *
 * @param {string} message       - The user's current message
 * @param {Array}  history       - Prior turns: [{ role: 'user'|'model', text: string }]
 * @returns {Promise<string>}    - Gemini's reply
 */
const getGeminiReply = async (message, history = []) => {
  const model = buildModel(); // fresh instance each call — safe and simple

  // Convert history to Gemini's expected format
  const formattedHistory = history
    .filter((h) => h.role && h.text)
    .map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

  const chat = model.startChat({
    history: formattedHistory,
    generationConfig: {
      maxOutputTokens: 400,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(message);
  const text = result.response.text();

  if (!text || text.trim() === '') {
    throw new Error('Empty response from Gemini');
  }

  return text.trim();
};

module.exports = { getGeminiReply };
