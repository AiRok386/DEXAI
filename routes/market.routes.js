// routes/market.routes.js

const express = require('express');
const router = express.Router();
const Market = require('../models/Market');

// GET all latest market data (for all symbols)
router.get('/', async (req, res) => {
  try {
    const marketData = await Market.find({});
    res.json(marketData);
  } catch (error) {
    console.error('❌ Error fetching market data:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// GET market data for a specific symbol (e.g., BTCUSDT)
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const data = await Market.findOne({ symbol });

    if (!data) {
      return res.status(404).json({ error: 'Market data not found for this symbol' });
    }

    res.json(data);
  } catch (error) {
    console.error(`❌ Error fetching data for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch symbol data' });
  }
});

module.exports = router;
