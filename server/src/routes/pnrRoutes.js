const express = require('express');
const { verifyPnr, getPnrHistory } = require('../controllers/pnrController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/verify', verifyPnr);
router.get('/history', getPnrHistory);

module.exports = router;
