// routes/market.routes.js

const express = require('express');
const router = express.Router();
const Market = require('../models/market.model');

// @desc    Get all Binance market data
// @route   GET /api/markets
// @access  Public
router.get('/', async (req, res) => {
  try {
    const data = await Market.find({});
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Error fetching market data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
