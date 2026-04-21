const Message = require('../models/Message');
const User = require('../models/User');

// Generate a consistent conversation ID from two user IDs (sorted)
const makeConversationId = (id1, id2) => [id1.toString(), id2.toString()].sort().join('_');

// ─────────────────────────────────────────────
// @desc    Send a message to any user
// @route   POST /api/messages
// @access  Private (all roles)
// ─────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }

    const receiver = await User.findById(receiverId).select('name role isActive');
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }
    if (!receiver.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot message a deactivated user' });
    }

    const conversationId = makeConversationId(req.user._id, receiverId);

    const message = await Message.create({
      sender: req.user._id,
      senderRole: req.user.role,
      receiver: receiverId,
      receiverRole: receiver.role,
      content: content.trim(),
      conversationId,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name role')
      .populate('receiver', 'name role');

    // Real-time delivery via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('new_message', populated);
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get conversation between current user and another user
// @route   GET /api/messages/conversation/:userId
// @access  Private
// ─────────────────────────────────────────────
const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversationId = makeConversationId(req.user._id, userId);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Mark incoming messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all conversations (inbox) for current user
// @route   GET /api/messages/conversations
// @access  Private
// ─────────────────────────────────────────────
const getConversations = async (req, res, next) => {
  try {
    // Aggregate: get the latest message per conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $replaceRoot: { newRoot: { $mergeObjects: ['$lastMessage', { unreadCount: '$unreadCount' }] } } },
      { $sort: { createdAt: -1 } },
    ]);

    // Populate sender/receiver
    const populated = await Message.populate(conversations, [
      { path: 'sender', select: 'name role' },
      { path: 'receiver', select: 'name role' },
    ]);

    res.json({ success: true, conversations: populated });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get unread message count for current user
// @route   GET /api/messages/unread-count
// @access  Private
// ─────────────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Mark all messages in a conversation as read
// @route   PATCH /api/messages/conversation/:userId/read
// @access  Private
// ─────────────────────────────────────────────
const markConversationRead = async (req, res, next) => {
  try {
    const conversationId = makeConversationId(req.user._id, req.params.userId);
    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Admin: get list of all users to message
// @route   GET /api/messages/admin/users
// @access  Private (admin only)
// ─────────────────────────────────────────────
const getMessageableUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const filter = { _id: { $ne: req.user._id }, isActive: true };
    if (role) filter.role = role;
    if (search) filter.name = new RegExp(search, 'i');

    const users = await User.find(filter)
      .select('name email phone role')
      .sort('name')
      .limit(100);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  markConversationRead,
  getMessageableUsers,
};
