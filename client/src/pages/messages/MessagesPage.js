import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSend, FiSearch, FiMessageSquare, FiUsers, FiRefreshCw } from 'react-icons/fi';
import {
  sendMessage,
  getConversation,
  getConversations,
  getMessageableUsers,
  markConversationRead,
} from '../../services/messageService';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import './Messages.css';

// Role color map
const ROLE_COLORS = {
  admin: '#7c3aed',
  officer: '#059669',
  passenger: '#2563eb',
  vendor: '#d97706',
};

const UserAvatar = ({ name, role, size = 36 }) => (
  <div
    style={{
      width: size, height: size, borderRadius: 8,
      background: ROLE_COLORS[role] || '#64748b',
      color: 'white', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700,
      fontSize: size * 0.38, flexShrink: 0,
    }}
  >
    {name?.charAt(0).toUpperCase()}
  </div>
);

const MessagesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  // Admin: user picker
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerRole, setPickerRole] = useState('');
  const [pickerUsers, setPickerUsers] = useState([]);
  const [loadingPicker, setLoadingPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Load conversations ──────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const convs = await getConversations();
      setConversations(convs);
    } catch {}
    setLoadingConvs(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Load messages when user selected ───────────────────────
  useEffect(() => {
    if (!selectedUserId) return;
    setLoadingMsgs(true);
    getConversation(selectedUserId)
      .then((msgs) => { setMessages(msgs); markConversationRead(selectedUserId).catch(() => {}); })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [selectedUserId]);

  // ── Auto-scroll ─────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages]);

  // ── Admin: load picker users ────────────────────────────────
  useEffect(() => {
    if (!showUserPicker) return;
    setLoadingPicker(true);
    getMessageableUsers({ search: pickerSearch, role: pickerRole })
      .then(setPickerUsers)
      .catch(() => {})
      .finally(() => setLoadingPicker(false));
  }, [showUserPicker, pickerSearch, pickerRole]);

  // ── Select a conversation partner ──────────────────────────
  const selectUser = (targetUser) => {
    setSelectedUserId(targetUser._id);
    setSelectedUser(targetUser);
    setShowUserPicker(false);
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Send message ────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(selectedUserId, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      loadConversations(); // refresh inbox
    } catch {}
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  // ── Helpers ─────────────────────────────────────────────────
  const isMine = (m) =>
    m.sender?._id === user?._id || m.sender === user?._id;

  const getOtherUser = (conv) => {
    const senderId = conv.sender?._id || conv.sender;
    return senderId?.toString() === user?._id?.toString() ? conv.receiver : conv.sender;
  };

  const filteredConvs = conversations.filter((c) => {
    const other = getOtherUser(c);
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const fmt = (d) => {
    const date = new Date(d);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="messages-layout">
      {/* ── Sidebar ── */}
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <div className="messages-sidebar-title">
            Messages
            <button
              className="messages-refresh-btn"
              onClick={loadConversations}
              title="Refresh"
            >
              <FiRefreshCw size={13} />
            </button>
          </div>

          {/* Admin: new conversation button */}
          {isAdmin && (
            <button
              className="messages-new-btn"
              onClick={() => setShowUserPicker(true)}
            >
              <FiUsers size={13} /> New Message
            </button>
          )}

          <div className="messages-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="users-list">
          {loadingConvs ? (
            <Spinner center size="sm" />
          ) : filteredConvs.length === 0 ? (
            <div className="messages-empty-sidebar">
              <FiMessageSquare size={24} />
              <p>{isAdmin ? 'Click "New Message" to start' : 'No conversations yet'}</p>
            </div>
          ) : filteredConvs.map((conv) => {
            const other = getOtherUser(conv);
            const isSelected = selectedUserId === (other?._id || other);
            return (
              <div
                key={conv._id}
                className={`user-item ${isSelected ? 'active' : ''}`}
                onClick={() => selectUser(other)}
              >
                <UserAvatar name={other?.name} role={other?.role} />
                <div className="user-item-info">
                  <div className="user-item-top">
                    <span className="user-item-name">{other?.name || 'Unknown'}</span>
                    <span className="user-item-time">{fmt(conv.createdAt)}</span>
                  </div>
                  <div className="user-item-bottom">
                    <span className="user-item-preview">
                      {isMine(conv) ? 'You: ' : ''}{conv.content}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="user-item-unread">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="messages-chat">
        {!selectedUserId ? (
          <div className="messages-empty">
            <div className="messages-empty-icon"><FiMessageSquare /></div>
            <div className="messages-empty-title">Select a conversation</div>
            <div className="messages-empty-text">
              {isAdmin
                ? 'Choose a conversation or click "New Message" to contact any user'
                : 'Choose a conversation from the left to start chatting'}
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <UserAvatar name={selectedUser?.name} role={selectedUser?.role} size={38} />
              <div className="chat-header-info">
                <div className="chat-header-name">{selectedUser?.name}</div>
                <div className="chat-header-meta">
                  <Badge label={selectedUser?.role} type={selectedUser?.role} />
                  {selectedUser?.email && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {selectedUser.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {loadingMsgs ? (
                <Spinner center />
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="chat-no-messages">
                      No messages yet. Send the first one! 👋
                    </div>
                  )}
                  {messages.map((m) => (
                    <div key={m._id} className={`message ${isMine(m) ? 'sent' : 'received'}`}>
                      {!isMine(m) && (
                        <div className="message-sender-name">{m.sender?.name}</div>
                      )}
                      <div className="message-bubble">{m.content}</div>
                      <div className="message-time">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMine(m) && (
                          <span className="message-read-status">
                            {m.isRead ? ' ✓✓' : ' ✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <form className="chat-input" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                placeholder={`Message ${selectedUser?.name}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={sending || !newMessage.trim()}
              >
                <FiSend />
              </button>
            </form>
          </>
        )}
      </div>

      {/* ── Admin: User Picker Modal ── */}
      {showUserPicker && (
        <div className="user-picker-overlay" onClick={() => setShowUserPicker(false)}>
          <div className="user-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-picker-header">
              <h3>Select User to Message</h3>
              <button onClick={() => setShowUserPicker(false)}>✕</button>
            </div>

            <div className="user-picker-filters">
              <div className="messages-search" style={{ flex: 1 }}>
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <select
                value={pickerRole}
                onChange={(e) => setPickerRole(e.target.value)}
                className="user-picker-role-select"
              >
                <option value="">All Roles</option>
                <option value="passenger">Passenger</option>
                <option value="officer">Officer</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div className="user-picker-list">
              {loadingPicker ? (
                <Spinner center size="sm" />
              ) : pickerUsers.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No users found
                </div>
              ) : pickerUsers.map((u) => (
                <div
                  key={u._id}
                  className="user-picker-item"
                  onClick={() => selectUser(u)}
                >
                  <UserAvatar name={u.name} role={u.role} size={36} />
                  <div className="user-picker-item-info">
                    <div className="user-picker-item-name">{u.name}</div>
                    <div className="user-picker-item-meta">
                      <Badge label={u.role} type={u.role} />
                      <span>{u.email}</span>
                      {u.phone && <span>📞 {u.phone}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
