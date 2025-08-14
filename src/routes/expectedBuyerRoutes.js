const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addExpectedBuyer,
  getExpectedBuyers
} = require('../controllers/expectedBuyerController');

// Employee: Add new expected buyer
router.post('/', auth, addExpectedBuyer);

// Admin or Employee: Get expected buyers
router.get('/', auth, getExpectedBuyers);

module.exports = router;
