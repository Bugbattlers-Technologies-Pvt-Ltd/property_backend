const ExpectedBuyer = require('../models/ExpectedBuyer');
const { responseHandler } = require('../utils/responseHandler');
const { ROLES } = require('../utils/constants');

// Add a new expected buyer (Employee only)
const addExpectedBuyer = async (req, res) => {
  try {
    const {
      fullName,
      contactNumber,
      emailAddress,
      preferredLocation,
      budget,
      propertyType,
      requirementDetails
    } = req.body;

    const newBuyer = new ExpectedBuyer({
      employee: req.user._id,
      fullName,
      contactNumber,
      emailAddress,
      preferredLocation,
      budget,
      propertyType,
      requirementDetails
    });

    const savedBuyer = await newBuyer.save();
    responseHandler.success(res, savedBuyer, 'Expected buyer added');
  } catch (err) {
    console.error('Add Expected Buyer Error:', err);
    responseHandler.error(res, 'Failed to add expected buyer', 500);
  }
};

// Admin sees all, Employee sees their own
const getExpectedBuyers = async (req, res) => {
  try {
    const query = req.user.role === ROLES.ADMIN
      ? {}
      : { employee: req.user._id };

    const buyers = await ExpectedBuyer.find(query).populate('employee', 'name email');
    responseHandler.success(res, buyers, 'Expected buyers fetched');
  } catch (err) {
    console.error('Get Expected Buyers Error:', err);
    responseHandler.error(res, 'Failed to fetch expected buyers', 500);
  }
};

module.exports = {
  addExpectedBuyer,
  getExpectedBuyers
};
