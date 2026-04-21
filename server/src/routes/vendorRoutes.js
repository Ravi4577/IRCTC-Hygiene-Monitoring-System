const express = require('express');
const {
  getVendors, getAllVendors, getVendor,
  adminCreateVendor, createVendor, updateVendor,
  toggleVendorStatus, deleteVendor,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', getVendors);

// Protected admin routes (must be before /:id to avoid conflict)
router.use(protect);
router.get('/admin/all', authorize('admin'), getAllVendors);
router.post('/admin-create', authorize('admin'), adminCreateVendor);
router.post('/', authorize('admin', 'vendor'), createVendor);

// Routes with :id param
router.get('/:id', getVendor);
router.put('/:id', authorize('admin', 'vendor'), updateVendor);
router.patch('/:id/toggle-status', authorize('admin'), toggleVendorStatus);
router.delete('/:id', authorize('admin'), deleteVendor);

module.exports = router;
