const express = require('express');
const router = express.Router();
const { getEmployeeDashboardStats } = require('../controllers/employeeDashboardController');

// Optional: middleware for auth and role check
//const { verifyToken, isEmployee } = require('../middleware/authMiddleware');

//router.get('/dashboard', verifyToken, isEmployee, getEmployeeDashboardStats);
// For testing without auth, you can temporarily skip middleware:
 router.get('/dashboard', getEmployeeDashboardStats);

module.exports = router;
