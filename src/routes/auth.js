const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");
const adminController = require("../controllers/adminController");
const multer = require("multer"); // ✅ Added multer
const { multiUpload } = require("../utils/multerS3"); // ✅ Updated import for multiUpload

const {
  registerAdmin,
  registerUser,
  loginAdmin,
  loginUser,
  getMe,
  sendOtp,
  verifyOtpAndReset,
} = authController;

const router = express.Router();
console.log("✅ Auth routes loaded");

// ✅ Admin registration/login (without validation)
router.post("/admin/register", multiUpload, registerAdmin);
router.post("/admin/login", loginAdmin);

// ✅ Admin updates user approval status
router.patch(
  "/admin/user/:userId/approval",
  auth,
  roleAuth([ROLES.ADMIN]),
  adminController.updateApprovalStatus
);

// ✅ Employee / Agent registration/login (with multer for form-data)
router.post("/user/register", multiUpload,  registerUser); // ✅ Updated here
router.post("/user/login", loginUser);

// ✅ Get logged-in user info
router.get("/me", auth, getMe);

// ✅ Password reset (OTP based)
router.post("/forgot-password", sendOtp);
router.post("/reset-password", verifyOtpAndReset);

module.exports = router;
