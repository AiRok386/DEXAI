const express = require('express');
const router = express.Router();
const Kline = require('../models/Kline');  // Import the Kline model

// Route to get all candlestick data for all symbols
router.get('/', async (req, res) => {
  try {
    // Fetch all candlestick data entries from the database
    const klines = await Kline.find({});
    res.json(klines);  // Return the kline data as a JSON response
  } catch (error) {
    console.error('❌ Error fetching klines:', error);
    res.status(500).json({ error: '❌ Failed to fetch klines' });
  }
});

// Route to get candlestick data for a specific symbol (e.g., BTC-USDT)
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;  // Get the symbol from the URL params
  try {
    // Fetch the kline data for the specific symbol
    const klines = await Kline.find({ symbol });
    if (!klines || klines.length === 0) {
      return res.status(404).json({ error: '❌ No klines found for symbol' });
    }
    res.json(klines);  // Return the klines for the symbol
  } catch (error) {
    console.error('❌ Error fetching klines:', error);
    res.status(500).json({ error: '❌ Failed to fetch klines for symbol' });
  }
});

module.exports = router;
