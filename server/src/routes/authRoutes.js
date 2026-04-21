const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// ── Register ──────────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    // Block admin role at the validator level (belt-and-suspenders)
    body('role')
      .optional()
      .isIn(['passenger', 'officer', 'vendor'])
      .withMessage('Invalid role. Allowed: passenger, officer, vendor'),
    // Phone required for passengers
    body('phone')
      .if(body('role').equals('passenger'))
      .notEmpty().withMessage('Phone number is required for passengers')
      .matches(/^[0-9]{10}$/).withMessage('Enter a valid 10-digit phone number'),
  ],
  validate,
  register
);

// ── Login ─────────────────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
