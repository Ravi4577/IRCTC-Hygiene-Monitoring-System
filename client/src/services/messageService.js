import api from './api';

/** Send a message to a user */
export const sendMessage = (receiverId, content) =>
  api.post('/messages', { receiverId, content }).then((r) => r.data.message);

/** Get conversation with a specific user */
export const getConversation = (userId) =>
  api.get(`/messages/conversation/${userId}`).then((r) => r.data.messages);

/** Get all conversations (inbox) */
export const getConversations = () =>
  api.get('/messages/conversations').then((r) => r.data.conversations);

/** Get unread message count */
export const getUnreadCount = () =>
  api.get('/messages/unread-count').then((r) => r.data.count);

/** Admin: get list of messageable users */
export const getMessageableUsers = (params = {}) =>
  api.get('/messages/admin/users', { params }).then((r) => r.data.users);

/** Mark conversation as read */
export const markConversationRead = (userId) =>
  api.patch(`/messages/conversation/${userId}/read`);
