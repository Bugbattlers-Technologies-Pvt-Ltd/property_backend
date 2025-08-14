const mongoose = require('mongoose');

const importantDocumentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{ type: String }], // S3 URLs
}, { timestamps: true });

module.exports = mongoose.model('ImportantDocument', importantDocumentSchema);
