// routes/kline.routes.js

const express = require('express');
const router = express.Router();
const Kline = require('../models/Kline');

// @route   GET /api/klines
// @desc    Get all klines across all symbols and intervals (for debugging or admin use)
router.get('/', async (req, res) => {
  try {
    const klines = await Kline.find({}).sort({ openTime: -1 }).limit(500);
    res.status(200).json(klines);
  } catch (error) {
    console.error('❌ Error fetching all klines:', error.message);
    res.status(500).json({ error: 'Failed to fetch all candlestick data' });
  }
});

// @route   GET /api/klines/:symbol
// @desc    Get all klines for a given symbol (all intervals)
// @example /api/klines/BTCUSDT
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const klines = await Kline.find({ symbol: symbol.toUpperCase() })
      .sort({ openTime: -1 })
      .limit(100);
    
    if (!klines.length) {
      return res.status(404).json({ error: 'No candlestick data found for this symbol' });
    }

    res.status(200).json(klines);
  } catch (error) {
    console.error(`❌ Error fetching klines for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch candlestick data' });
  }
});

// @route   GET /api/klines/:symbol/:interval
// @desc    Get latest 100 klines for a given symbol and interval
// @example /api/klines/BTCUSDT/1m
router.get('/:symbol/:interval', async (req, res) => {
  const { symbol, interval } = req.params;

  try {
    const klines = await Kline.find({
      symbol: symbol.toUpperCase(),
      interval
    })
      .sort({ openTime: -1 })
      .limit(100);

    if (!klines.length) {
      return res.status(404).json({ error: 'No candlestick data found for this symbol and interval' });
    }

    res.status(200).json(klines);
  } catch (error) {
    console.error(`❌ Failed to fetch klines for ${symbol} (${interval}):`, error.message);
    res.status(500).json({ error: 'Failed to fetch candlestick data' });
  }
});

module.exports = router;
