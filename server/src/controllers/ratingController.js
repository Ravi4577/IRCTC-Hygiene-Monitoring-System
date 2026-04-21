const Rating = require('../models/Rating');
const Vendor = require('../models/Vendor');

// Helper: recalculate vendor average rating
const recalcVendorRating = async (vendorId) => {
  const stats = await Rating.aggregate([
    { $match: { vendor: vendorId } },
    { $group: { _id: '$vendor', avgRating: { $avg: '$overall' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Vendor.findByIdAndUpdate(vendorId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].count,
    });
  }
};

// @desc    Submit rating
// @route   POST /api/ratings
const createRating = async (req, res, next) => {
  try {
    const { vendor, overall, foodQuality, cleanliness, service, value, review, pnrNumber, trainNumber } = req.body;

    const existing = await Rating.findOne({ vendor, ratedBy: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already rated this vendor' });
    }

    const rating = await Rating.create({
      vendor, overall, foodQuality, cleanliness, service, value,
      review, pnrNumber, trainNumber, ratedBy: req.user._id,
    });

    await recalcVendorRating(rating.vendor);
    res.status(201).json({ success: true, rating });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ratings for a vendor
// @route   GET /api/ratings/vendor/:vendorId
const getVendorRatings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const ratings = await Rating.find({ vendor: req.params.vendorId })
      .populate('ratedBy', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Rating.countDocuments({ vendor: req.params.vendorId });
    res.json({ success: true, total, ratings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rating
// @route   PUT /api/ratings/:id
const updateRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ success: false, message: 'Rating not found' });
    if (rating.ratedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Rating.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await recalcVendorRating(updated.vendor);
    res.json({ success: true, rating: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
const deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ success: false, message: 'Rating not found' });

    if (req.user.role !== 'admin' && rating.ratedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const vendorId = rating.vendor;
    await rating.deleteOne();
    await recalcVendorRating(vendorId);
    res.json({ success: true, message: 'Rating deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRating, getVendorRatings, updateRating, deleteRating };
