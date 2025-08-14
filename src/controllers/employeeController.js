const User = require('../models/user');
const { ROLES } = require('../utils/constants');
const { responseHandler } = require('../utils/responseHandler');

// This function creates a new employee.
const createEmployee = async (req, res) => {
  try {
    const { name, email, mobile, aadhar, address, photo, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return responseHandler.error(res, 'Employee with this email already exists', 409);
    }

    const employee = await User.create({
      name,
      email,
      mobile,
      aadhar,
      address,
      photo,
      password,
      role: ROLES.EMPLOYEE
    });

    responseHandler.success(res, employee, 'Employee created successfully', 201);
  } catch (err) {
    console.error('createEmployee error:', err);
    responseHandler.error(res, 'Failed to create employee', 500);
  }
};

// **FIX:** Added the missing getAllEmployees function.
// This function finds all users in the database with the 'EMPLOYEE' role.
const getAllEmployees = async (req, res) => {
  try {
    // Find all users where the 'role' field matches ROLES.EMPLOYEE
    const employees = await User.find({ role: ROLES.EMPLOYEE });

    // Use the responseHandler to send the list of employees back to the client.
    responseHandler.success(res, employees, 'Employees fetched successfully');
  } catch (err) {
    // Log the error and send a generic error message.
    console.error('getAllEmployees error:', err);
    responseHandler.error(res, 'Failed to fetch employees', 500);
  }
};

// **FIX:** Export both functions so they can be used in your routes.
module.exports = {
  createEmployee,
  getAllEmployees
};
