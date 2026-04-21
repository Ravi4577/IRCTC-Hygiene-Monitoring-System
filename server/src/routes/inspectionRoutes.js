const express = require('express');
const { createInspection, getInspections, getInspection, completeInspection, deleteInspection } = require('../controllers/inspectionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'officer'), getInspections)
  .post(authorize('admin', 'officer'), createInspection);

router.route('/:id')
  .get(authorize('admin', 'officer'), getInspection)
  .delete(authorize('admin'), deleteInspection);

router.patch('/:id/complete', authorize('officer'), completeInspection);

module.exports = router;
