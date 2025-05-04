// routes/orderbook.js

const express = require('express');
const router = express.Router();
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

// @route   GET /api/orderbook/:symbol
// @desc    Get the latest order book snapshot from MongoDB for a given symbol
// @example /api/orderbook/BTCUSDT
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const snapshot = await OrderBookSnapshot.findOne({ symbol })
      .sort({ createdAt: -1 });

    if (!snapshot) {
      return res.status(404).json({ error: 'Order book not found for this symbol' });
    }

    res.json(snapshot);
  } catch (error) {
    console.error(`❌ Error fetching order book for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch order book data' });
  }
});

module.exports = router;
