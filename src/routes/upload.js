const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  uploadFiles,
  getAllUploads,
  deleteUpload,
  deleteSingleFile,
} = require('../controllers/uploadController');

// 1. Configure multer with memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// 2. Upload endpoint — uses same field name as frontend: 'files'
router.post('/upload', upload.array('files'), uploadFiles);

// 3. Get all uploaded documents
router.get('/uploads', getAllUploads);

// 4. Delete one document
router.delete('/uploads/:id', deleteUpload);

// for one single file
router.delete('/uploads/:uploadId/files/:fileId', deleteSingleFile);

module.exports = router;
