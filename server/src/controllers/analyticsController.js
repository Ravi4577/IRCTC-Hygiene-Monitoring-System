const Complaint = require('../models/Complaint');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Inspection = require('../models/Inspection');
const Rating = require('../models/Rating');

// @desc    Get admin analytics overview
// @route   GET /api/analytics/overview
const getOverview = async (req, res, next) => {
  try {
    const [
      totalUsers, totalVendors, totalComplaints, totalInspections,
      pendingComplaints, resolvedComplaints, avgRating,
    ] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments({ isActive: true }),
      Complaint.countDocuments(),
      Inspection.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Rating.aggregate([{ $group: { _id: null, avg: { $avg: '$overall' } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers, totalVendors, totalComplaints, totalInspections,
        pendingComplaints, resolvedComplaints,
        averageRating: avgRating[0]?.avg?.toFixed(1) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints by status (for chart)
// @route   GET /api/analytics/complaints-by-status
const complaintsByStatus = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints by category
// @route   GET /api/analytics/complaints-by-category
const complaintsByCategory = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly complaint trends
// @route   GET /api/analytics/monthly-trends
const monthlyTrends = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top vendors by rating
// @route   GET /api/analytics/top-vendors
const topVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ isActive: true, totalRatings: { $gt: 0 } })
      .sort('-averageRating -hygieneScore')
      .limit(10)
      .select('name stationName averageRating hygieneScore totalRatings');
    res.json({ success: true, vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sentiment distribution
// @route   GET /api/analytics/sentiment
const sentimentDistribution = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      { $match: { 'sentiment.label': { $exists: true } } },
      { $group: { _id: '$sentiment.label', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, complaintsByStatus, complaintsByCategory, monthlyTrends, topVendors, sentimentDistribution };
