const Property = require('../models/Property');
const User = require('../models/user');
const ImportantDocument = require('../models/ImportantDocument');
const ImportantContact = require('../models/ImportantContact');
const { responseHandler } = require('../utils/responseHandler');

// 📊 Admin Dashboard Overview
const adminDashboard = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password');
    const employees = await User.find({ role: 'employee' }).select('-password');
    const properties = await Property.find();

    res.status(200).json({
      success: true,
      data: { agents, employees, properties }
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Admin dashboard failed' });
  }
};

// 📊 Admin Stats
const getStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const soldProperties = await Property.countDocuments({ status: 'sold' });
    const pendingProperties = await Property.countDocuments({ status: 'pending' });
    const withdrawnProperties = await Property.countDocuments({ status: 'withdrawn' });

    const totalAgents = await User.countDocuments({ role: 'agent' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    const agentStats = await User.aggregate([
      { $match: { role: 'agent' } },
      {
        $lookup: {
          from: 'properties',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'properties'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalProperties: { $size: '$properties' },
          soldProperties: {
            $size: {
              $filter: {
                input: '$properties',
                as: 'prop',
                cond: { $eq: ['$$prop.status', 'sold'] }
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        soldProperties,
        pendingProperties,
        withdrawnProperties,
        totalAgents,
        totalEmployees,
        agentStats
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard stats failed',
      error: error.message
    });
  }
};

// 🧑‍💼 Employee Dashboard
const employeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const [documents, contacts, agents, properties] = await Promise.all([
      ImportantDocument.find({ employee: employeeId }),
      ImportantContact.find({ employee: employeeId }),
      User.find({ role: 'agent' }).select('-password'),
      Property.find().select('-pricing -registryDocument -soldPrice')
    ]);

    res.status(200).json({
      success: true,
      data: {
        documents,
        contacts,
        agents,
        properties
      }
    });
  } catch (err) {
    console.error('Employee Dashboard Error:', err);
    res.status(500).json({
      success: false,
      message: 'Employee dashboard fetch failed',
      error: err.message
    });
  }
};

// 🧑 Agent Dashboard
const agentDashboard = async (req, res) => {
  try {
    const agentId = req.user._id;

    const agent = await User.findById(agentId).select('name email mobileNumber');

    const properties = await Property.find({ createdBy: agentId }).select(
      '-pricing -registryDocument -soldPrice'
    );

    res.status(200).json({
      success: true,
      data: {
        agent,
        properties
      }
    });
  } catch (err) {
    console.error('Agent Dashboard Error:', err);
    res.status(500).json({
      success: false,
      message: 'Agent dashboard fetch failed',
      error: err.message
    });
  }
};

// 🔍 View All Properties (Admin use)
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('createdBy', 'name role');
    res.status(200).json({ success: true, data: properties });
  } catch (err) {
    console.error('Admin - Get Properties Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: err.message
    });
  }
};

// 🧑‍💼 View All Agents (Admin use)
const getAllAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password');
    res.status(200).json({ success: true, data: agents });
  } catch (err) {
    console.error('Admin - Get Agents Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents',
      error: err.message
    });
  }
};

// 👨‍💼 View All Employees (Admin use)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    console.error('Admin - Get Employees Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: err.message
    });
  }
};

// 📇 View All Important Contacts (Admin use)
const getAllImportantContacts = async (req, res) => {
  try {
    const contacts = await ImportantContact.find()
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: contacts,
      message: 'All contacts fetched successfully'
    });
  } catch (err) {
    console.error('Admin - Get Contacts Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch important contacts',
      error: err.message
    });
  }
};

module.exports = {
  getStats,
  employeeDashboard,
  agentDashboard,
  getAllProperties,
  getAllAgents,
  getAllEmployees,
  adminDashboard,
  getAllImportantContacts
};
