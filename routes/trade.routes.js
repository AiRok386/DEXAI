const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');

// GET /api/trades
// Returns all trades in the database
router.get('/', async (req, res) => {
  try {
    const trades = await Trade.find({}).sort({ timestamp: -1 });
    if (!trades.length) {
      return res.status(404).json({ error: '❌ No trades found in the database' });
    }
    res.status(200).json(trades);
  } catch (error) {
    console.error('❌ Error fetching all trades:', error.message);
    res.status(500).json({ error: '❌ Internal server error while retrieving trades' });
  }
});

// GET /api/trades/:symbol
// Returns the latest 50 trades for a given symbol (e.g., BTC-USDT)
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const trades = await Trade.find({ symbol })
      .sort({ timestamp: -1 })
      .limit(50);

    if (!trades.length) {
      return res.status(404).json({ error: `❌ No trades found for symbol ${symbol}` });
    }

    res.status(200).json(trades);
  } catch (error) {
    console.error(`❌ Error fetching trades for ${symbol}:`, error.message);
    res.status(500).json({ error: '❌ Failed to fetch trade data for symbol' });
  }
});

module.exports = router;
