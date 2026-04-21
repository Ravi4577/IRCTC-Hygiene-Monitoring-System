/**
 * Seed Script — IRCTC Hygiene Monitoring System
 *
 * Creates:
 *  - 1 admin account (credentials from .env or defaults below)
 *  - Sample officer, passenger, vendor accounts
 *  - Sample vendors, complaints, inspections, alerts
 *
 * Run:  cd server && npm run seed
 *
 * ⚠️  To change admin credentials:
 *      Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env
 *      Then re-run: npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const User       = require('../models/User');
const Vendor     = require('../models/Vendor');
const Complaint  = require('../models/Complaint');
const Inspection = require('../models/Inspection');
const Alert      = require('../models/Alert');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/irctc_hygiene';

// ── Admin credentials — set in .env, never hardcode in source ────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@irctc.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'System Admin';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  // Clear all collections
  await Promise.all([
    User.deleteMany(),
    Vendor.deleteMany(),
    Complaint.deleteMany(),
    Inspection.deleteMany(),
    Alert.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Hash passwords ──────────────────────────────────────────────────────────
  const adminHash   = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const sampleHash  = await bcrypt.hash('Sample@123', 12);   // sample accounts only

  // ── Create users ────────────────────────────────────────────────────────────
  const users = await User.insertMany([
    // Admin — credentials from env (email lowercased to match login normalisation)
    {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.trim().toLowerCase(),
      password: adminHash,
      role: 'admin',
      isActive: true,
    },
    // Officer sample
    {
      name: 'Rajesh Kumar',
      email: 'officer@irctc.com',
      password: sampleHash,
      role: 'officer',
      phone: '9000000001',
      badgeNumber: 'OFF001',
      assignedStation: 'New Delhi',
      isActive: true,
    },
    // Passenger sample
    {
      name: 'Priya Sharma',
      email: 'passenger@irctc.com',
      password: sampleHash,
      role: 'passenger',
      phone: '9876543210',
      isActive: true,
    },
    // Vendor user sample
    {
      name: 'Suresh Patel',
      email: 'vendor@irctc.com',
      password: sampleHash,
      role: 'vendor',
      phone: '9000000003',
      isActive: true,
    },
    // Second passenger sample
    {
      name: 'Amit Singh',
      email: 'passenger2@irctc.com',
      password: sampleHash,
      role: 'passenger',
      phone: '9000000004',
      isActive: true,
    },
  ]);
  console.log('👤 Users created');

  // ── Create vendors ──────────────────────────────────────────────────────────
  const vendors = await Vendor.insertMany([
    {
      name: 'Suresh Caterers Pvt Ltd',
      licenseNumber: 'LIC001',
      owner: users[3]._id,
      stationName: 'New Delhi',
      trainNumbers: ['12301', '12302'],
      category: 'pantry',
      description: 'Premium pantry car catering service',
      contactPhone: '9876543210',
      contactEmail: 'suresh@caterers.com',
      averageRating: 4.2,
      totalRatings: 45,
      hygieneScore: 82,
    },
    {
      name: 'Mumbai Tiffin Services',
      licenseNumber: 'LIC002',
      owner: users[3]._id,
      stationName: 'Mumbai Central',
      trainNumbers: ['12951', '12952'],
      category: 'catering',
      description: 'Authentic Mumbai street food on trains',
      contactPhone: '9123456789',
      contactEmail: 'mumbai@tiffin.com',
      averageRating: 3.8,
      totalRatings: 32,
      hygieneScore: 71,
    },
    {
      name: 'Howrah Platform Stall',
      licenseNumber: 'LIC003',
      stationName: 'Howrah',
      category: 'platform_stall',
      description: 'Quick snacks and beverages at Howrah station',
      averageRating: 3.5,
      totalRatings: 18,
      hygieneScore: 65,
    },
  ]);
  console.log('🏪 Vendors created');

  // ── Create complaints ───────────────────────────────────────────────────────
  const complaints = await Complaint.insertMany([
    {
      title: 'Stale food served in pantry car',
      description: 'The food served was stale and had a bad smell. Very unhygienic conditions.',
      category: 'food_quality',
      status: 'pending',
      priority: 'high',
      submittedBy: users[2]._id,
      vendor: vendors[0]._id,
      trainNumber: '12301',
      stationName: 'New Delhi',
      sentiment: { label: 'negative', score: -0.8 },
      statusHistory: [{ status: 'pending', updatedBy: users[2]._id, note: 'Complaint submitted' }],
    },
    {
      title: 'Excellent service and clean food',
      description: 'The food was fresh and delicious. Staff was very friendly and helpful.',
      category: 'service',
      status: 'resolved',
      priority: 'low',
      submittedBy: users[4]._id,
      vendor: vendors[1]._id,
      trainNumber: '12951',
      sentiment: { label: 'positive', score: 0.9 },
      statusHistory: [
        { status: 'pending', updatedBy: users[4]._id, note: 'Submitted' },
        { status: 'resolved', updatedBy: users[1]._id, note: 'Acknowledged and appreciated' },
      ],
    },
    {
      title: 'Overpriced items at platform stall',
      description: 'The vendor is charging double the MRP for packaged items.',
      category: 'pricing',
      status: 'in_progress',
      priority: 'medium',
      submittedBy: users[2]._id,
      vendor: vendors[2]._id,
      stationName: 'Howrah',
      assignedTo: users[1]._id,
      sentiment: { label: 'negative', score: -0.6 },
      statusHistory: [
        { status: 'pending', updatedBy: users[2]._id, note: 'Submitted' },
        { status: 'in_progress', updatedBy: users[1]._id, note: 'Under investigation' },
      ],
    },
  ]);
  console.log('📋 Complaints created');

  // ── Create inspections ──────────────────────────────────────────────────────
  await Inspection.insertMany([
    {
      vendor: vendors[0]._id,
      inspector: users[1]._id,
      scheduledDate: new Date('2024-12-20'),
      completedDate: new Date('2024-12-20'),
      status: 'completed',
      type: 'routine',
      stationName: 'New Delhi',
      checklist: {
        foodStorage: 8, cookingArea: 9, servingArea: 8, staffHygiene: 9,
        wasteManagement: 7, pestControl: 8, waterQuality: 9, documentation: 8,
      },
      overallScore: 82,
      grade: 'B',
      findings: 'Overall good hygiene standards. Minor improvements needed in waste management.',
      recommendations: 'Improve waste disposal frequency during peak hours.',
    },
    {
      vendor: vendors[2]._id,
      inspector: users[1]._id,
      scheduledDate: new Date('2025-01-15'),
      status: 'scheduled',
      type: 'complaint_based',
      stationName: 'Howrah',
      relatedComplaint: complaints[2]._id,
    },
  ]);
  console.log('🔍 Inspections created');

  // ── Create alerts ───────────────────────────────────────────────────────────
  await Alert.insertMany([
    {
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Jan 20, 2025 from 2AM–4AM IST.',
      type: 'info',
      targetRole: 'all',
      createdBy: users[0]._id,
    },
    {
      title: 'New Complaint Requires Attention',
      message: 'High priority complaint about stale food on Train 12301.',
      type: 'warning',
      targetRole: 'officer',
      createdBy: users[0]._id,
      relatedEntity: { entityType: 'complaint', entityId: complaints[0]._id },
    },
  ]);
  console.log('🔔 Alerts created');

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  LOGIN CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Admin     : ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}`);
  console.log('  Officer   : officer@irctc.com   /  Sample@123');
  console.log('  Passenger : passenger@irctc.com /  Sample@123');
  console.log('  Vendor    : vendor@irctc.com    /  Sample@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ⚠️  Change ADMIN_EMAIL / ADMIN_PASSWORD in .env');
  console.log('     then re-run: npm run seed');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
