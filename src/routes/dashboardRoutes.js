const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");
const dashboardController = require("../controllers/dashboardController");

// 👑 Admin Dashboard Routes
router.get(
  "/admin/stats",
  auth,

  dashboardController.getStats
);

router.get(
  "/admin/properties",
  auth,
  roleAuth([ROLES.ADMIN]),
  dashboardController.getAllProperties
);

router.get(
  "/admin/agents",
  auth,
  roleAuth([ROLES.ADMIN]),
  dashboardController.getAllAgents
);

router.get(
  "/admin/employees",
  auth,
  roleAuth([ROLES.ADMIN]),
  dashboardController.getAllEmployees
);

// router.get(
//   '/admin/contacts',
//   auth,
//   roleAuth([ROLES.ADMIN]),
//   dashboardController.getAllImportantContacts
// );

router.get(
  "/admin",
  auth,
  roleAuth([ROLES.ADMIN]),
  dashboardController.adminDashboard
);

// 👨‍💼 Agent Dashboard
router.get(
  "/agent/agent",
  auth,
  roleAuth([ROLES.AGENT]),
  dashboardController.agentDashboard
);

router.get(
  "/agent/property",
  auth,
  roleAuth([ROLES.AGENT]),
  dashboardController.agentDashboard
);
// 👷‍♂️ Employee Dashboard
router.get(
  "/employee/employee",
  auth,
  roleAuth([ROLES.EMPLOYEE]),
  dashboardController.employeeDashboard
);

// router.post(
//   '/contacts',
//   auth,
//   roleAuth([ROLES.EMPLOYEE]),
//   dashboardController.employeeDashboard
// );

module.exports = router;
