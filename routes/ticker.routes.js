// routes/ticker.routes.js

const express = require('express');
const router = express.Router();
const Ticker = require('../models/Ticker');

// @route   GET /api/ticker
// @desc    Get all latest ticker data
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tickers = await Ticker.find().sort({ symbol: 1 });
    res.json(tickers);
  } catch (err) {
    console.error('❌ Error fetching ticker data:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/ticker/:symbol
// @desc    Get ticker for a specific symbol
// @access  Public
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const ticker = await Ticker.findOne({ symbol });

    if (!ticker) {
      return res.status(404).json({ error: 'Ticker not found' });
    }

    res.json(ticker);
  } catch (err) {
    console.error(`❌ Error fetching ticker for ${req.params.symbol}:`, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
