const PnrVerification = require('../models/PnrVerification');

// Mock PNR data for demonstration
const mockPnrData = {
  '1234567890': {
    trainNumber: '12301',
    trainName: 'Rajdhani Express',
    journeyDate: new Date('2024-12-25'),
    fromStation: 'New Delhi',
    toStation: 'Howrah',
    passengerName: 'Passenger',
    seatClass: '2A',
    status: 'confirmed',
  },
  '9876543210': {
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani',
    journeyDate: new Date('2024-12-28'),
    fromStation: 'Mumbai Central',
    toStation: 'New Delhi',
    passengerName: 'Passenger',
    seatClass: '3A',
    status: 'confirmed',
  },
};

// @desc    Verify PNR number
// @route   POST /api/pnr/verify
const verifyPnr = async (req, res, next) => {
  try {
    const { pnrNumber } = req.body;

    // Check if already verified
    const existing = await PnrVerification.findOne({ pnrNumber });
    if (existing) {
      return res.json({ success: true, data: existing, cached: true });
    }

    // Mock API call (replace with real IRCTC API)
    const mockData = mockPnrData[pnrNumber];
    const isVerified = !!mockData;

    const verification = await PnrVerification.create({
      pnrNumber,
      verifiedBy: req.user._id,
      isVerified,
      verifiedAt: new Date(),
      status: isVerified ? mockData.status : 'invalid',
      ...(mockData || {}),
    });

    res.json({
      success: true,
      isVerified,
      data: verification,
      message: isVerified ? 'PNR verified successfully' : 'Invalid PNR number',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get PNR verification history
// @route   GET /api/pnr/history
const getPnrHistory = async (req, res, next) => {
  try {
    const history = await PnrVerification.find({ verifiedBy: req.user._id }).sort('-createdAt').limit(20);
    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyPnr, getPnrHistory };
