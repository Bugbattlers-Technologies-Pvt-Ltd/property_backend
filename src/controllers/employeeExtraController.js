const ImportantDocument = require('../models/ImportantDocument');
const ImportantContact = require('../models/ImportantContact');
const { responseHandler } = require('../utils/responseHandler');
const { ROLES } = require('../utils/constants');

// 📁 Upload Documents (Multiple S3 file URLs)
const uploadDocuments = async (req, res) => {
  try {
    const employeeId = req.user._id;

    if (!req.files || req.files.length === 0) {
      return responseHandler.error(res, 'No files uploaded', 400);
    }

    const urls = req.files.map(file => file.location);

    const doc = await ImportantDocument.create({
      employee: employeeId,
      files: urls
    });

    responseHandler.success(res, doc, 'Documents uploaded successfully');
  } catch (err) {
    console.error('Upload documents error:', err);
    responseHandler.error(res, 'Upload failed', 500);
  }
};

// 📁 Get Documents (admin sees all, employee sees own)
const getDocuments = async (req, res) => {
  try {
    const query = req.user.role === ROLES.ADMIN ? {} : { employee: req.user._id };
    const docs = await ImportantDocument.find(query).sort({ createdAt: -1 });
    responseHandler.success(res, docs, 'Documents fetched successfully');
  } catch (err) {
    console.error('Get documents error:', err);
    responseHandler.error(res, 'Error fetching documents', 500);
  }
};

// 📇 Add Contact
const addContact = async (req, res) => {
  try {
    const { name, email, contactNumber } = req.body;

    if (!name || !contactNumber) {
      return responseHandler.error(res, 'Name and contact number are required', 400);
    }

    const contact = await ImportantContact.create({
      employee: req.user._id,
      name,
      email,
      contactNumber
    });

    responseHandler.success(res, contact, 'Contact added successfully');
  } catch (err) {
    console.error('Add contact error:', err);
    responseHandler.error(res, 'Error adding contact', 500);
  }
};

// 📇 Get Contacts (admin sees all, employee sees own)
const getContacts = async (req, res) => {
  try {
    const query = req.user.role === ROLES.ADMIN ? {} : { employee: req.user._id };
    const contacts = await ImportantContact.find(query).sort({ createdAt: -1 });
    responseHandler.success(res, contacts, 'Contacts fetched successfully');
  } catch (err) {
    console.error('Get contacts error:', err);
    responseHandler.error(res, 'Error fetching contacts', 500);
  }
};

module.exports = {
  uploadDocuments,
  getDocuments,
  addContact,
  getContacts
};
