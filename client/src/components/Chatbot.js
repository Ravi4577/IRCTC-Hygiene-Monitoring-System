import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiRefreshCw } from 'react-icons/fi';
import { sendChatMessage } from '../services/chatbotService';
import './Chatbot.css';

const WELCOME = {
  id: 'welcome',
  role: 'model',
  text: "Hi! I'm your IRCTC Hygiene Assistant 🚂\n\nI can help you with:\n• Filing & tracking complaints\n• PNR verification\n• Rating vendors\n• Platform navigation\n\nWhat can I help you with today?",
  time: new Date(),
};

const QUICK_QUESTIONS = [
  'How to file a complaint?',
  'Check my complaint status',
  'How to verify PNR?',
  'How to rate a vendor?',
  'Contact support',
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll whenever messages change or window opens
  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  }, [messages, open]);

  // Focus input when window opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Build history for Gemini — skip the static welcome message
  const buildHistory = () =>
    messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, text: m.text }));

  const send = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    const userMsg = { id: Date.now(), role: 'user', text: query, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { reply, source } = await sendChatMessage(query, buildHistory());
      const botMsg = {
        id: Date.now() + 1,
        role: 'model',
        text: reply,
        time: new Date(),
        isFallback: source === 'fallback',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'model',
          text: "Sorry, I couldn't connect right now. Please try again.",
          time: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const resetChat = () => setMessages([WELCOME]);

  const fmt = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Floating action button */}
      {!open && (
        <button className="chatbot-fab" onClick={() => setOpen(true)} aria-label="Open assistant">
          <FiMessageCircle />
          <span className="chatbot-fab-label">Help</span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <div className="chatbot-header-name">IRCTC Assistant</div>
                <div className="chatbot-header-status">
                  <span className="chatbot-online-dot" />
                  Powered by Gemini AI
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="chatbot-header-btn" onClick={resetChat} title="Clear chat">
                <FiRefreshCw />
              </button>
              <button className="chatbot-header-btn" onClick={() => setOpen(false)} aria-label="Close">
                <FiX />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-msg chatbot-msg--${msg.role === 'user' ? 'user' : 'bot'}`}
              >
                {msg.role !== 'user' && (
                  <div className="chatbot-msg-avatar">🤖</div>
                )}
                <div className="chatbot-msg-content">
                  <div
                    className={[
                      'chatbot-msg-bubble',
                      msg.isError ? 'chatbot-msg-bubble--error' : '',
                    ].join(' ').trim()}
                  >
                    {msg.text.split('\n').map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <div className="chatbot-msg-time">{fmt(msg.time)}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chatbot-msg chatbot-msg--bot">
                <div className="chatbot-msg-avatar">🤖</div>
                <div className="chatbot-msg-content">
                  <div className="chatbot-msg-bubble chatbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions — only shown at the start */}
          {messages.length <= 1 && (
            <div className="chatbot-quick">
              {QUICK_QUESTIONS.map((q) => (
                <button key={q} className="chatbot-quick-btn" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="off"
            />
            <button
              className="chatbot-send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
