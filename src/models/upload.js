const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: String,
  url: String,
  key: String,
});

const uploadSchema = new mongoose.Schema({
  uploaderName: String,
  files: [fileSchema],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Upload', uploadSchema);
