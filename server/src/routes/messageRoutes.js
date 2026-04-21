const express = require('express');
const {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  markConversationRead,
  getMessageableUsers,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Inbox & conversations
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);

// Admin: list users to message
router.get('/admin/users', authorize('admin'), getMessageableUsers);

// Conversation with a specific user
router.get('/conversation/:userId', getConversation);
router.patch('/conversation/:userId/read', markConversationRead);

// Send message (works for all roles)
router.post('/', sendMessage);

module.exports = router;
