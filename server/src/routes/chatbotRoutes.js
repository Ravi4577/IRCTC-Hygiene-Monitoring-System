const express = require('express');
const { sendMessage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/message', sendMessage);

module.exports = router;
