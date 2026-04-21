import api from './api';

/**
 * Send a message to the Gemini-powered chatbot.
 * @param {string} message  - User's message
 * @param {Array}  history  - [{ role: 'user'|'model', text: string }]
 * @returns {Promise<{ reply: string, source: string }>}
 */
export const sendChatMessage = async (message, history = []) => {
  const res = await api.post('/chatbot/message', { message, history });
  return { reply: res.data.reply, source: res.data.source };
};
