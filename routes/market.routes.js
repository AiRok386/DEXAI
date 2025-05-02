const express = require('express');
const router = express.Router();
const { getAllMarkets } = require('../controllers/marketController');

// GET /api/markets
router.get('/', getAllMarkets);

module.exports = router;
