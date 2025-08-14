const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function registerUser({ name, email, mobile, aadhar, password, role }) {
  const exists = await User.findOne({ email });
  if (exists) throw new Error('Email already registered');

  const user = new User({ name, email, mobile, aadhar, password, role });
  await user.save();
  return user;
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const match = await user.comparePassword(password);
  if (!match) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { user, token };
}

module.exports = { registerUser, loginUser };
