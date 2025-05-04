// routes/market.routes.js

const express = require('express');
const router = express.Router();
const Market = require('../models/Market'); // Mongoose model

// @route   GET /api/market/:symbol
// @desc    Get market data for a specific trading pair (e.g. BTCUSDT)
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const marketData = await Market.findOne({ symbol });

    if (!marketData) {
      return res.status(404).json({ error: 'Market data not found for ' + symbol });
    }

    res.json(marketData);
  } catch (error) {
    console.error('❌ Error fetching market data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
