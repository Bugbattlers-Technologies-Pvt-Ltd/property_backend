const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const { responseHandler } = require("../utils/responseHandler");
const sendEmail = require("../utils/emailService");
const generateOtp = require("../utils/generateOtp");

// 🔐 Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// 🔖 Register Admin
const registerAdmin = async (req, res) => {
  return baseRegister(req, res, "admin");
};

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return responseHandler.error(res, "Validation failed", 400, errors.array());

    const { name, email, password, mobile, aadhar, address, pan, role } = req.body;

    if (!["employee", "agent"].includes(role)) {
      return responseHandler.error(res, "Invalid role. Must be employee or agent.", 400);
    }

    // Build duplicate check query dynamically
    const query = [{ email }];
    if (mobile) query.push({ mobile });
    if (aadhar) query.push({ aadhar });

    const existing = await User.findOne({ $or: query });
    if (existing) return responseHandler.error(res, "User already exists", 400);

    const photoFile = req.files?.photos?.[0];
    const photoUrl = photoFile?.location || null;

    const user = new User({
      name,
      email,
      password,
      mobile,
      aadhar,
      address,
      pan,
      photo: photoUrl,
      role,
      approvalStatus: "on-hold",
    });

    await user.save();

    responseHandler.success(res, { user }, `${role} registered successfully. Awaiting admin approval.`, 201);
  } catch (error) {
    console.error("User Registration error:", error);
    responseHandler.error(res, "User registration failed", 500);
  }
};

const baseRegister = async (req, res, role) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return responseHandler.error(res, "Validation failed", 400, errors.array());

    const { name, email, password, mobile, aadhar, address, pan } = req.body;

    // Build duplicate check query dynamically
    const query = [{ email }];
    if (mobile) query.push({ mobile });
    if (aadhar) query.push({ aadhar });

    const existing = await User.findOne({ $or: query });
    if (existing) return responseHandler.error(res, "User already exists", 400);

    const photoFile = req.files?.photo?.[0];
    const photoUrl = photoFile?.location || null;

    const user = new User({
      name,
      email,
      password,
      mobile,
      aadhar,
      address,
      pan,
      role,
      photo: photoUrl,
    });

    await user.save();

    const token = generateToken(user);
    responseHandler.success(res, { user, token }, `${role} registered successfully`, 201);
  } catch (error) {
    console.error(`${role} Registration error:`, error);
    responseHandler.error(res, `${role} registration failed`, 500);
  }
};


// 🔓 Login Admin
const loginAdmin = async (req, res) => {
  return baseLogin(req, res, "admin");
};

// 🔓 Login Employee or Agent
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !["employee", "agent"].includes(user.role) || !user.isActive) {
      return responseHandler.error(res, "Invalid credentials", 401);
    }

    if (user.approvalStatus !== "approved") {
      return responseHandler.error(
        res,
        "Account is on hold or not approved yet",
        403
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return responseHandler.error(res, "Invalid credentials", 401);

    const token = generateToken(user);
    user.password = undefined;
    responseHandler.success(
      res,
      { user, token },
      `${user.role} login successful`
    );
  } catch (error) {
    console.error("User login error:", error);
    responseHandler.error(res, "User login failed", 500);
  }
};

// 🔄 Shared Login Logic
const baseLogin = async (req, res, role) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== role || !user.isActive)
      return responseHandler.error(res, "Invalid credentials", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return responseHandler.error(res, "Invalid credentials", 401);

    const token = generateToken(user);
    user.password = undefined;
    responseHandler.success(res, { user, token }, `${role} login successful`);
  } catch (error) {
    console.error(`${role} login error:`, error);
    responseHandler.error(res, `${role} login failed`, 500);
  }
};

// 👤 Get Current User Info
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return responseHandler.error(res, "Unauthorized", 401);
    }
    responseHandler.success(
      res,
      { user: req.user },
      "User data retrieved successfully",
      200
    );
  } catch (error) {
    console.error("getMe error:", error);
    responseHandler.error(res, "Failed to retrieve user", 500);
  }
};

// 📩 Send OTP
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return responseHandler.error(res, "Email not found", 404);

    const { otp, expiresAt } = generateOtp();
    user.otp = { code: otp, expiresAt };
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Your OTP for Password Reset",
      message: `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });

    responseHandler.success(res, null, "OTP sent to email");
  } catch (error) {
    console.error("Send OTP error:", error);
    responseHandler.error(res, "Failed to send OTP", 500);
  }
};

// 🔄 Verify OTP and Reset Password
const verifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (
      !user ||
      !user.otp ||
      user.otp.code !== otp ||
      user.otp.expiresAt < new Date()
    ) {
      return responseHandler.error(res, "Invalid or expired OTP", 400);
    }

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user);
    responseHandler.success(res, { user, token }, "Password reset successful");
  } catch (error) {
    console.error("Verify OTP error:", error);
    responseHandler.error(res, "Failed to reset password", 500);
  }
};

module.exports = {
  registerAdmin,
  registerUser,
  loginAdmin,
  loginUser,
  getMe,
  sendOtp,
  verifyOtpAndReset,
};
