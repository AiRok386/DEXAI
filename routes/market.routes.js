// routes/market.routes.js

const express = require('express');
const router = express.Router();
const { getMarketDataFromMemory } = require('../utils/binanceUpdater');

// @route   GET /api/market/top
// @desc    Get in-memory top 15 market data
// @access  Public
router.get('/top', (req, res) => {
  try {
    const data = getMarketDataFromMemory();
    res.status(200).json({
      success: true,
      count: Object.keys(data).length,
      data: Object.values(data)
    });
  } catch (error) {
    console.error('❌ Error returning market data:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
