const User = require('../models/user');
const { responseHandler } = require('../utils/responseHandler');

// ✅ Update user's approvalStatus (approve, hold, reject)
const updateApprovalStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    //const { status } = req.body;
    const status = req.body.status || req.body.approvalStatus; 
    
    // Ensure valid status
    const validStatuses = ['approved', 'on-hold', 'rejected'];
    if (!validStatuses.includes(status)) {
      return responseHandler.error(
        res,
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        400
      );
    }

    const user = await User.findById(userId);
    if (!user || user.role === 'admin') {
      return responseHandler.error(res, 'Invalid user or cannot change admin status', 400);
    }

    user.approvalStatus = status;
    await user.save();

    responseHandler.success(res, user, `User ${user.name} marked as "${status}"`);
  } catch (error) {
    console.error('Approval status update error:', error);
    responseHandler.error(res, 'Failed to update approval status', 500);
  }
};

module.exports = {
  updateApprovalStatus
};
