const express = require('express');
const { createRating, getVendorRatings, updateRating, deleteRating } = require('../controllers/ratingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/vendor/:vendorId', getVendorRatings);

router.use(protect);
router.post('/', authorize('passenger'), createRating);
router.put('/:id', authorize('passenger'), updateRating);
router.delete('/:id', protect, deleteRating);

module.exports = router;
