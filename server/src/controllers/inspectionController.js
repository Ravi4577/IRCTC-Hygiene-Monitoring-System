const Inspection = require('../models/Inspection');
const Vendor = require('../models/Vendor');
const Alert = require('../models/Alert');

// Calculate grade from score
const getGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
};

// @desc    Create inspection
// @route   POST /api/inspections
const createInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.create({ ...req.body, inspector: req.user._id });
    res.status(201).json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inspections
// @route   GET /api/inspections
const getInspections = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (req.user.role === 'officer') filter.inspector = req.user._id;
    if (status) filter.status = status;

    const inspections = await Inspection.find(filter)
      .populate('vendor', 'name stationName')
      .populate('inspector', 'name badgeNumber')
      .sort('-scheduledDate')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Inspection.countDocuments(filter);
    res.json({ success: true, total, inspections });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inspection
// @route   GET /api/inspections/:id
const getInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('vendor', 'name stationName licenseNumber')
      .populate('inspector', 'name badgeNumber email');
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete inspection with checklist
// @route   PATCH /api/inspections/:id/complete
const completeInspection = async (req, res, next) => {
  try {
    const { checklist, findings, recommendations, followUpRequired, followUpDate } = req.body;

    // Calculate overall score (average of checklist items * 10)
    const scores = Object.values(checklist).filter((v) => v !== undefined);
    const overallScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) : 0;
    const grade = getGrade(overallScore);

    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      {
        checklist, findings, recommendations, followUpRequired, followUpDate,
        overallScore, grade, status: 'completed', completedDate: new Date(),
      },
      { new: true }
    );

    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });

    // Update vendor hygiene score
    await Vendor.findByIdAndUpdate(inspection.vendor, {
      hygieneScore: overallScore,
      lastInspectionDate: new Date(),
    });

    // Alert if grade is D or F
    if (['D', 'F'].includes(grade)) {
      await Alert.create({
        title: 'Low Hygiene Score Alert',
        message: `Vendor received grade ${grade} (${overallScore}/100) in inspection`,
        type: 'danger',
        targetRole: 'admin',
        createdBy: req.user._id,
        relatedEntity: { entityType: 'inspection', entityId: inspection._id },
      });
    }

    res.json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inspection (admin)
// @route   DELETE /api/inspections/:id
const deleteInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByIdAndDelete(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, message: 'Inspection deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createInspection, getInspections, getInspection, completeInspection, deleteInspection };
