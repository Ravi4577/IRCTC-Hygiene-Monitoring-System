const Complaint = require('../models/Complaint');
const Alert = require('../models/Alert');
const { analyzeSentiment } = require('../services/aiService');

// @desc    Submit complaint (with optional image upload)
// @route   POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, vendor, trainNumber, stationName, pnrNumber, priority } = req.body;

    // Collect uploaded image paths
    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    // Run AI sentiment analysis
    const sentiment = await analyzeSentiment(description);

    const complaint = await Complaint.create({
      title, description, category, vendor: vendor || undefined,
      trainNumber, stationName, pnrNumber, priority,
      submittedBy: req.user._id,
      sentiment,
      images,
      statusHistory: [{ status: 'pending', updatedBy: req.user._id, note: 'Complaint submitted' }],
    });

    // Create alert for admins/officers
    await Alert.create({
      title: 'New Complaint Submitted',
      message: `Complaint: "${title}" submitted by ${req.user.name}`,
      type: 'warning',
      targetRole: 'officer',
      createdBy: req.user._id,
      relatedEntity: { entityType: 'complaint', entityId: complaint._id },
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints (filtered by role)
// @route   GET /api/complaints
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (req.user.role === 'passenger') filter.submittedBy = req.user._id;
    if (req.user.role === 'officer') filter.assignedTo = req.user._id;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('vendor', 'name stationName')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Complaint.countDocuments(filter);
    res.json({ success: true, total, complaints });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('vendor', 'name stationName');

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note, assignedTo, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (resolution) complaint.resolution = resolution;
    if (status === 'resolved') complaint.resolvedAt = new Date();

    complaint.statusHistory.push({ status, updatedBy: req.user._id, note });
    await complaint.save();

    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (admin)
// @route   DELETE /api/complaints/:id
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createComplaint, getComplaints, getComplaint, updateComplaintStatus, deleteComplaint };
