const { responseHandler } = require('../utils/responseHandler');

const roleAuth = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const role = req.user?.role?.toLowerCase();

      // Normalize allowed roles
      const normalizedRoles = allowedRoles.map(r => r.toLowerCase());

      console.log('🔍 roleAuth → req.user.role:', role);
      console.log('🔐 Allowed roles:', normalizedRoles);

      if (!role || !normalizedRoles.includes(role)) {
        return responseHandler.error(res, 'Access denied: insufficient permissions', 403);
      }

      next();
    } catch (err) {
      console.error('❌ Role check error:', err);
      return responseHandler.error(res, 'Authorization error', 500);
    }
  };
};

module.exports = roleAuth;
