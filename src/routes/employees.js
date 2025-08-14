const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");

const employeeController = require("../controllers/employeeController");
const employeeExtraController = require("../controllers/employeeExtraController");
//const { upload, uploadSingle, uploadPhotos, uploadFields } = require('../middleware/s3Upload');

// ✅ Employee creation by admin
router.post(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]),
  employeeController.createEmployee
);

// 📁 Upload Important Documents (employee only)
router.post(
  "/documents",
  auth,
  roleAuth([ROLES.EMPLOYEE]),
  //upload.array('documents', 10),
  employeeExtraController.uploadDocuments
);

// 📁 View Documents (admin sees all, employee sees own)
router.get(
  "/documents",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]),
  employeeExtraController.getDocuments
);

// 📇 Add Contact (employee only)
router.post(
  "/contacts",
  auth,
  roleAuth([ROLES.EMPLOYEE]),
  employeeExtraController.addContact
);

// 📇 View Contacts (admin sees all, employee sees own)
router.get(
  "/contacts",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]),
  employeeExtraController.getContacts
);

module.exports = router;
