const Property = require('../models/Property');
const User = require('../models/user');

const getEmployeeDashboardStats = async (req, res) => {
  try {
    const [totalProperties, totalAgents, pending, active, sold] = await Promise.all([
      Property.countDocuments(),
      User.countDocuments({ role: 'agent' }),
      Property.countDocuments({ status: 'pending' }),
      Property.countDocuments({ status: 'active' }),
      Property.countDocuments({ status: 'sold' })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalProperties,
        totalAgents,
        pendingProperties: pending,
        activeProperties: active,
        soldProperties: sold
      }
    });
  } catch (err) {
    console.error('Employee dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getEmployeeDashboardStats };
