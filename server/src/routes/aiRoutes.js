const express = require('express');
const { analyzeText, getInsights } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeText);
router.get('/insights', authorize('admin'), getInsights);

module.exports = router;
