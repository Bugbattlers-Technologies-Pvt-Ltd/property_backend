const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true,},
  mobile: { type: String, unique: true, sparse: true },
  aadhar: { type: String, unique: true, sparse: true },

  address: { type: String, },
  photo: { type: String, default: null },
  role: { type: String, enum: ['admin', 'employee', 'agent'], default: 'employee' },
  password: { type: String, required: true, minlength: 6, select: false },
  otp: {
    code: { type: String },
    expiresAt: { type: Date }
  },
  isActive: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['approved', 'on-hold' ,'rejected'], default: 'on-hold' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// 🔒 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔐 Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🧽 Remove sensitive fields from output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// 🔑 Generate reset password token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// 📌 Add indexes for faster role/isActive queries
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('User', userSchema);
