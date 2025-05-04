const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');  // Import the Trade model

// Route to get all trade data for all symbols
router.get('/', async (req, res) => {
  try {
    // Fetch all trade entries from the database
    const trades = await Trade.find({});
    res.json(trades);  // Return the trades as a JSON response
  } catch (error) {
    console.error('❌ Error fetching trades:', error);
    res.status(500).json({ error: '❌ Failed to fetch trades' });
  }
});

// Route to get trade data for a specific symbol (e.g., BTC-USDT)
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;  // Get the symbol from the URL params
  try {
    // Fetch the trades for the specific symbol
    const trades = await Trade.find({ symbol });
    if (!trades || trades.length === 0) {
      return res.status(404).json({ error: '❌ No trades found for symbol' });
    }
    res.json(trades);  // Return the trades for the symbol
  } catch (error) {
    console.error('❌ Error fetching trades:', error);
    res.status(500).json({ error: '❌ Failed to fetch trades for symbol' });
  }
});

module.exports = router;
