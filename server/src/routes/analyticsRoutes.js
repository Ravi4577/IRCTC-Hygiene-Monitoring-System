const express = require('express');
const { getOverview, complaintsByStatus, complaintsByCategory, monthlyTrends, topVendors, sentimentDistribution } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin', 'officer'));

router.get('/overview', getOverview);
router.get('/complaints-by-status', complaintsByStatus);
router.get('/complaints-by-category', complaintsByCategory);
router.get('/monthly-trends', monthlyTrends);
router.get('/top-vendors', topVendors);
router.get('/sentiment', sentimentDistribution);

module.exports = router;
