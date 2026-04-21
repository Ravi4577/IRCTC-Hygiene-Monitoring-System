const express = require('express');
const { getAlerts, createAlert, markRead, markAllRead } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.post('/', authorize('admin', 'officer'), createAlert);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
