const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { responseHandler } = require('../utils/responseHandler');
const { ROLES } = require('../utils/constants');

const router = express.Router();

/**
 * ============================
 * EMPLOYEE ROUTES (CRUD)
 * ============================
 */

// GET all employees
router.get('/employees', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee', isActive: true }).select('-password');
    responseHandler.success(res, { count: employees.length, employees }, 'Employee list');
  } catch (error) {
    console.error('Fetch employees error:', error);
    responseHandler.error(res, 'Failed to get employees', 500, error);
  }
});

// POST add new employee
router.post('/employees', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), async (req, res) => {
  try {
    const { name, mobile, email, aadhar, address, photo } = req.body;
    if (!name || !mobile || !email || !aadhar) {
      return responseHandler.error(res, 'Missing required fields', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseHandler.error(res, 'Employee with this email already exists', 400);
    }

    const newEmployee = new User({
      name,
      mobile,
      email,
      aadhar,
      address,
      photo,
      role: 'employee',
      isActive: true,
      approvalStatus: 'on-hold',
      password: 'Temp@123', // Default password
    });

    await newEmployee.save();
    responseHandler.success(res, newEmployee, 'Employee created successfully');
  } catch (error) {
    console.error('Add employee error:', error);
    responseHandler.error(res, 'Failed to add employee', 500, error);
  }
});

// PUT update employee
router.put('/employees/:id', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), async (req, res) => {
  try {
    const updatedEmployee = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'employee' },
      req.body,
      { new: true }
    ).select('-password');

    if (!updatedEmployee) {
      return responseHandler.error(res, 'Employee not found', 404);
    }

    responseHandler.success(res, updatedEmployee, 'Employee updated successfully');
  } catch (error) {
    console.error('Update employee error:', error);
    responseHandler.error(res, 'Failed to update employee', 500, error);
  }
});

// DELETE employee
router.delete('/employees/:id', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), async (req, res) => {
  try {
    const deletedEmployee = await User.findOneAndDelete({ _id: req.params.id, role: 'employee' });
    if (!deletedEmployee) {
      return responseHandler.error(res, 'Employee not found', 404);
    }
    responseHandler.success(res, null, 'Employee deleted successfully');
  } catch (error) {
    console.error('Delete employee error:', error);
    responseHandler.error(res, 'Failed to delete employee', 500, error);
  }
});

/**
 * ============================
 * AGENT ROUTES (CRUD)
 * ============================
 */

// GET all agents
// GET all agents (Paginated & Optimized)
router.get('/agents', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), async (req, res) => {
  try {
     console.log('✅ Auth user:', req.user);
    console.log('📄 Query params:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { role: 'agent', isActive: true };

    const [agents, total] = await Promise.all([
      User.find(filter)
        .select('name email mobile aadhar address photo approvalStatus createdAt') // select only needed fields
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    responseHandler.success(res, {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      count: agents.length,
      agents
    }, 'Agent list');
  } catch (error) {
    console.error('Fetch agents error:', error);
    responseHandler.error(res, 'Failed to get agents', 500, error);
  }
});


// POST add new agent
router.post('/agents', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), async (req, res) => {
  try {
    const { name, mobile, email, aadhar, address, photo } = req.body;
    if (!name || !mobile || !email || !aadhar) {
      return responseHandler.error(res, 'Missing required fields', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseHandler.error(res, 'Agent with this email already exists', 400);
    }

    const newAgent = new User({
      name,
      mobile,
      email,
      aadhar,
      address,
      photo,
      role: 'agent',
      isActive: true,
      approvalStatus: 'on-hold',
      password: 'Temp@123',
    });

    await newAgent.save();
    responseHandler.success(res, newAgent, 'Agent created successfully');
  } catch (error) {
    console.error('Add agent error:', error);
    responseHandler.error(res, 'Failed to add agent', 500, error);
  }
});

// PUT update agent
router.put('/agents/:id', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), async (req, res) => {
  try {
    const updatedAgent = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'agent' },
      req.body,
      { new: true }
    ).select('-password');

    if (!updatedAgent) {
      return responseHandler.error(res, 'Agent not found', 404);
    }

    responseHandler.success(res, updatedAgent, 'Agent updated successfully');
  } catch (error) {
    console.error('Update agent error:', error);
    responseHandler.error(res, 'Failed to update agent', 500, error);
  }
});

// DELETE agent
router.delete('/agents/:id', auth, roleAuth([ROLES.ADMIN, ROLES.EMPLOYEE]), async (req, res) => {
  try {
    const deletedAgent = await User.findOneAndDelete({ _id: req.params.id, role: 'agent' });
    if (!deletedAgent) {
      return responseHandler.error(res, 'Agent not found', 404);
    }
    responseHandler.success(res, null, 'Agent deleted successfully');
  } catch (error) {
    console.error('Delete agent error:', error);
    responseHandler.error(res, 'Failed to delete agent', 500, error);
  }
});

module.exports = router;
