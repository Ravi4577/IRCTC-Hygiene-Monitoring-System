const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Build the allowed-origins list from env + hardcoded dev defaults
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  // Production frontend — set CLIENT_URL on Render
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  // Extra origins (comma-separated) — e.g. EXTRA_ORIGINS=https://a.com,https://b.com
  ...(process.env.EXTRA_ORIGINS
    ? process.env.EXTRA_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight for every route
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/inspections', require('./routes/inspectionRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/pnr', require('./routes/pnrRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
