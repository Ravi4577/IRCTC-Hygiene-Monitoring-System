const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Normalise email consistently — trim whitespace and lowercase
// This must match exactly what the User model stores
const normaliseEmail = (email) =>
  (email || '').trim().toLowerCase();

// ── Register ──────────────────────────────────────────────────────────────────

// @desc    Register a new user (passenger / vendor / officer only)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, password, role, phone } = req.body;
    const email = normaliseEmail(req.body.email);

    // Block admin registration through public endpoint
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created through registration.',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }

    const user = await User.create({ name, email, password, role: role || 'passenger', phone });

    res.status(201).json({
      success: true,
      // Return user info but NO token — user must log in manually
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const email    = normaliseEmail(req.body.email);
    const password = req.body.password;

    // Find user — include password field for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        phone:  user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Me / Logout ───────────────────────────────────────────────────────────────

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

module.exports = { register, login, getMe, logout };
