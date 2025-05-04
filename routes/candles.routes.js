// routes/candles.routes.js

const express = require('express');
const router = express.Router();
const Kline = require('../models/Kline');

// @route   GET /api/candles/:symbol/:interval
// @desc    Get the latest 100 candlestick data from MongoDB for given symbol and interval
// @example /api/candles/BTCUSDT/1m
router.get('/:symbol/:interval', async (req, res) => {
  const { symbol, interval } = req.params;

  try {
    const klines = await Kline.find({
      symbol: symbol.toUpperCase(),
      interval: interval
    })
      .sort({ openTime: -1 })
      .limit(100);

    if (!klines.length) {
      return res.status(404).json({ error: 'No candlestick data found for this symbol and interval.' });
    }

    res.json(klines);
  } catch (error) {
    console.error(`❌ Error fetching Kline data for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch candlestick data' });
  }
});

module.exports = router;
