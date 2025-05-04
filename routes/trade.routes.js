// routes/trades.routes.js

const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');

// GET /api/trades/
// Fetches all trades from all symbols (useful for admin or debugging)
router.get('/', async (req, res) => {
  try {
    const trades = await Trade.find({}).sort({ timestamp: -1 }).limit(200);
    res.status(200).json(trades);
  } catch (error) {
    console.error('❌ Error fetching all trades:', error.message);
    res.status(500).json({ error: 'Internal server error fetching all trades' });
  }
});

// GET /api/trades/:symbol
// Fetches latest 50 trades for a specific symbol (e.g., BTCUSDT)
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const trades = await Trade.find({ symbol })
      .sort({ timestamp: -1 })
      .limit(50);

    if (!trades.length) {
      return res.status(404).json({ error: `No trades found for symbol ${symbol}` });
    }

    res.status(200).json(trades);
  } catch (error) {
    console.error(`❌ Error fetching trades for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Internal server error fetching trades' });
  }
});

module.exports = router;
