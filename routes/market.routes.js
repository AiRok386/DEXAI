// routes/market.routes.js
const express = require('express');
const router = express.Router();
const { updateAllMarkets, getAllMarkets } = require('../controllers/marketController');

router.get('/update', updateAllMarkets); // manually trigger update
router.get('/', getAllMarkets); // get live mirrored market data

module.exports = router;
