const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['passenger', 'officer', 'vendor', 'admin'],
      default: 'passenger',
    },
    phone: { type: String },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // Vendor-specific
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    // Officer-specific
    badgeNumber: { type: String },
    assignedStation: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
