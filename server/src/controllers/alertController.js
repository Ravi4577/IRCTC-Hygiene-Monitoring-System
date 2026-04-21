const Alert = require('../models/Alert');

// @desc    Get alerts for current user
// @route   GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const filter = {
      $or: [
        { targetRole: 'all' },
        { targetRole: req.user.role },
        { targetUser: req.user._id },
      ],
    };

    const alerts = await Alert.find(filter).sort('-createdAt').limit(50);
    const unreadCount = await Alert.countDocuments({ ...filter, readBy: { $ne: req.user._id } });
    res.json({ success: true, alerts, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Create alert (admin/officer)
// @route   POST /api/alerts
const createAlert = async (req, res, next) => {
  try {
    const alert = await Alert.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark alert as read
// @route   PATCH /api/alerts/:id/read
const markRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all alerts as read
// @route   PATCH /api/alerts/read-all
const markAllRead = async (req, res, next) => {
  try {
    await Alert.updateMany(
      { $or: [{ targetRole: 'all' }, { targetRole: req.user.role }, { targetUser: req.user._id }] },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, createAlert, markRead, markAllRead };
