// routes/market.routes.js

const express = require('express');
const router = express.Router();
const Market = require('../models/Market');

// @route   GET /api/market
// @desc    Get all market data for top 15 pairs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const marketData = await Market.find().sort({ symbol: 1 }); // Sorted alphabetically by symbol
    res.status(200).json(marketData);
  } catch (err) {
    console.error('❌ Error fetching all market data:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/market/:symbol
// @desc    Get market data by symbol (e.g., BTCUSDT)
// @access  Public
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const market = await Market.findOne({ symbol });

    if (!market) {
      return res.status(404).json({ error: `Market data not found for ${symbol}` });
    }

    res.status(200).json(market);
  } catch (err) {
    console.error(`❌ Error fetching market data for ${symbol}:`, err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
