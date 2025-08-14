const Agent = require('../models/Agent');
const Property = require('../models/Property');
const multer = require('multer');
const path = require('path');

// =======================
// Multer config for file uploads
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/agents/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// =======================
// Get all agents (Admin & Employee only)
// =======================
const getAllAgents = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (!['admin', 'employee'].includes(userRole))
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const agents = await Agent.find().select('-bankDetails -documents');
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// =======================
// Get single agent
// =======================
const getAgent = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const targetId = req.params.id;

    if (role === 'agent' && _id.toString() !== targetId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const agent = await Agent.findById(targetId).select(role === 'admin' ? '' : '-bankDetails -documents');
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    res.status(200).json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// =======================
// Create agent (Admin & Employee)
// =======================
const createAgent = async (req, res) => {
  try {
    if (!['admin', 'employee'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Only admin or employee can create agents.' });

    const { name, mobile, email, aadhar, pan, address, bankDetails } = req.body;
    if (!name || !mobile || !email || !aadhar || !pan) {
      return res.status(400).json({ success: false, message: 'Required fields: name, mobile, email, aadhar, pan' });
    }

    const agentData = {
      name, mobile, email, aadhar, pan, address,
      bankDetails, role: 'agent',
      createdBy: req.user._id,
      documents: {}
    };

    if (req.files) {
      if (req.files.photo) agentData.photo = req.files.photo[0].path;
      if (req.files.idProof) agentData.documents.idProof = req.files.idProof[0].path;
      if (req.files.agreement) agentData.documents.agreement = req.files.agreement[0].path;
    }

    const agent = await Agent.create(agentData);
    res.status(201).json({ success: true, message: 'Agent created successfully', data: agent });
  } catch (err) {
    const dup = err.code === 11000;
    res.status(dup ? 400 : 500).json({
      success: false,
      message: dup ? 'Agent with this email or mobile already exists' : 'Server Error',
      error: err.message
    });
  }
};

// =======================
// Update agent (Admin & Employee)
// =======================
const updateAgent = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const agentId = req.params.id;

    if (!['admin', 'employee'].includes(role) && _id.toString() !== agentId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updateData = { ...req.body };
    if (role === 'agent') {
      delete updateData.status;
      delete updateData.role;
      delete updateData.bankDetails;
    }

    if (req.files) {
      if (req.files.photo) updateData.photo = req.files.photo[0].path;
      if (req.files.idProof) {
        updateData.documents = updateData.documents || {};
        updateData.documents.idProof = req.files.idProof[0].path;
      }
      if (req.files.agreement) {
        updateData.documents = updateData.documents || {};
        updateData.documents.agreement = req.files.agreement[0].path;
      }
    }

    const agent = await Agent.findByIdAndUpdate(agentId, updateData, { new: true, runValidators: true });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    res.status(200).json({ success: true, message: 'Agent updated', data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// =======================
// Delete agent (Admin & Employee)
// =======================
const deleteAgent = async (req, res) => {
  try {
    if (!['admin', 'employee'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Only admin or employee can delete agents.' });

    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    res.status(200).json({ success: true, message: 'Agent deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// =======================
// Filter agents by status
// =======================
const getAgentsByStatus = async (req, res) => {
  try {
    if (!['admin', 'employee'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const { status } = req.params;
    const agents = await Agent.find({ status }).select('-bankDetails -documents');
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// =======================
// Search agents
// =======================
const searchAgents = async (req, res) => {
  try {
    if (!['admin', 'employee'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const { query } = req.query;
    const regex = new RegExp(query, 'i');

    const agents = await Agent.find({
      $or: [
        { name: regex },
        { email: regex },
        { mobile: regex }
      ]
    }).select('-bankDetails -documents');

    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// =======================
// Get agent properties
// =======================
const getAgentProperties = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const agentId = req.params.id;

    if (role === 'agent' && _id.toString() !== agentId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const properties = await Property.find({ createdBy: agentId })
      .select(role === 'admin' ? '' : '-pricing -registryDocument -soldPrice');

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// =======================
// Agent performance stats
// =======================
const getAgentStats = async (req, res) => {
  try {
    if (!['admin', 'employee'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Only admin or employee allowed.' });

    const agentId = req.params.id;
    const total = await Property.countDocuments({ createdBy: agentId });
    const sold = await Property.countDocuments({ createdBy: agentId, status: 'sold' });
    const pending = await Property.countDocuments({ createdBy: agentId, status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        totalProperties: total,
        soldProperties: sold,
        pendingProperties: pending,
        conversionRate: total > 0 ? ((sold / total) * 100).toFixed(2) : '0'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

module.exports = {
  getAllAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentsByStatus,
  searchAgents,
  getAgentProperties,
  getAgentStats,
  upload
};
