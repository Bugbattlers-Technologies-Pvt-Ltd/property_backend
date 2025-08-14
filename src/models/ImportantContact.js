const mongoose = require('mongoose');

const importantContactSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  email: { type: String },
  contactNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ImportantContact', importantContactSchema);
