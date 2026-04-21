const express = require('express');
const { createComplaint, getComplaints, getComplaint, updateComplaintStatus, deleteComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getComplaints)
  .post(authorize('passenger'), upload.array('images', 3), createComplaint);

router.route('/:id')
  .get(getComplaint)
  .delete(authorize('admin'), deleteComplaint);

router.patch('/:id/status', authorize('admin', 'officer'), updateComplaintStatus);

module.exports = router;
