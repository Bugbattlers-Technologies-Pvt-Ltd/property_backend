// src/routes/pdfExportRoutes.js

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { exportPropertiesPdf } = require('../controllers/exportPdfController');

// ✅ PDF Export Route
router.post('/export-pdf', auth, exportPropertiesPdf);

module.exports = router;
