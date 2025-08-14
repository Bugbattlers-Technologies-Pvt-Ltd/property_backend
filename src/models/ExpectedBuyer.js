const mongoose = require('mongoose');

const expectedBuyerSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emailAddress: { type: String, required: true },
  preferredLocation: { type: String, required: true },
  budget: { type: Number, required: true },
  propertyType: { type: String, required: true },
  requirementDetails: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ExpectedBuyer', expectedBuyerSchema);
