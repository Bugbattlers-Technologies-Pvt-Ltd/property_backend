// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('../utils/multerS3');
const auth = require('../middleware/auth');
const { Upload } = require('@aws-sdk/lib-storage');
//const { uploadPropertyFiles } = require('../controllers/uploadController');

// Multer S3 fields
const propertyUpload = multer.fields([
  { name: 'satbara', maxCount: 1 },
  { name: 'ferfar', maxCount: 1 },
  { name: 'eightA', maxCount: 1 },
  { name: 'tochNakasha', maxCount: 1 },
  { name: 'photos', maxCount: 10 },
  { name: 'agentProofDocs', maxCount: 5 },
  { name: 'importantDocs', maxCount: 5 },
  { name: 'photo', maxCount: 1 }, // for agent/employee photo
]);

router.post('/property-files', auth, propertyUpload, uploadPropertyFiles);

module.exports = router;
