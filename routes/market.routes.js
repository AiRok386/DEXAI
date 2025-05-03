// routes/market.routes.js

const express = require('express');
const router = express.Router();
const Market = require('../models/Market');

// @route   GET /api/market
// @desc    Get all market data (for top 15 pairs stored in DB)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const marketData = await Market.find({}).sort({ symbol: 1 });
    res.json(marketData);
  } catch (error) {
    console.error('❌ Failed to fetch market data:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// @route   GET /api/market/:symbol
// @desc    Get market data by symbol (e.g., BTCUSDT)
// @access  Public
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const market = await Market.findOne({ symbol });

    if (!market) {
      return res.status(404).json({ error: 'Market data not found for ' + symbol });
    }

    res.json(market);
  } catch (error) {
    console.error(`❌ Error fetching data for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: 'Server error while fetching market data' });
  }
});

module.exports = router;
