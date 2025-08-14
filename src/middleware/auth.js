const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const { responseHandler } = require('../utils/responseHandler');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return responseHandler.error(res, 'No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+role');


    if (!user || !user.isActive) {
      return responseHandler.error(res, 'User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return responseHandler.error(res, 'Invalid token', 401);
  }
};

module.exports = auth;