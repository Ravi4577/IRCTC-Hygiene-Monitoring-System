const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Get all vendors
// @route   GET /api/vendors
const getVendors = async (req, res, next) => {
  try {
    const { stationName, category, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (stationName) filter.stationName = new RegExp(stationName, 'i');
    if (category) filter.category = category;

    const vendors = await Vendor.find(filter)
      .populate('owner', 'name email phone')
      .sort('-averageRating')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Vendor.countDocuments(filter);
    res.json({ success: true, total, vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vendors including inactive (admin)
// @route   GET /api/vendors/all
const getAllVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.name = new RegExp(search, 'i');

    const vendors = await Vendor.find(filter)
      .populate('owner', 'name email phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Vendor.countDocuments(filter);
    res.json({ success: true, total, vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
const getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('owner', 'name email phone');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin creates vendor + vendor user account
// @route   POST /api/vendors/admin-create
const adminCreateVendor = async (req, res, next) => {
  try {
    const {
      vendorName, ownerName, email, phone, password,
      licenseNumber, stationName, category, description,
      contactPhone, contactEmail, address, trainNumbers,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check license number
    const existingVendor = await Vendor.findOne({ licenseNumber });
    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'License number already exists' });
    }

    // Create vendor user account
    const vendorUser = await User.create({
      name: ownerName,
      email,
      phone,
      password,
      role: 'vendor',
    });

    // Create vendor profile
    const vendor = await Vendor.create({
      name: vendorName,
      licenseNumber,
      owner: vendorUser._id,
      stationName,
      category,
      description,
      contactPhone: contactPhone || phone,
      contactEmail: contactEmail || email,
      address,
      trainNumbers: trainNumbers ? trainNumbers.split(',').map((t) => t.trim()) : [],
    });

    // Link vendor to user
    await User.findByIdAndUpdate(vendorUser._id, { vendorId: vendor._id });

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      vendor,
      vendorUser: { id: vendorUser._id, name: vendorUser.name, email: vendorUser.email },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vendor (self-registration)
// @route   POST /api/vendors
const createVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    if (req.user.role !== 'admin' && vendor.owner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, vendor: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle vendor active status (admin)
// @route   PATCH /api/vendors/:id/toggle-status
const toggleVendorStatus = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    vendor.isActive = !vendor.isActive;
    await vendor.save();
    res.json({ success: true, message: `Vendor ${vendor.isActive ? 'activated' : 'deactivated'}`, vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vendor (admin)
// @route   DELETE /api/vendors/:id
const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVendors, getAllVendors, getVendor, adminCreateVendor, createVendor, updateVendor, toggleVendorStatus, deleteVendor };
