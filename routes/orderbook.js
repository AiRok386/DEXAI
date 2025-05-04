// routes/orderbook.routes.js

const express = require('express');
const router = express.Router();
const OrderBook = require('../models/OrderBook');

// GET /api/orderbook/:symbol
// Returns the latest order book snapshot for a given symbol (e.g., BTCUSDT)
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const latestSnapshot = await OrderBook.findOne({ symbol })
      .sort({ updatedAt: -1 }); // Assuming timestamps are auto-managed

    if (!latestSnapshot) {
      return res.status(404).json({ error: 'Order book not found for this symbol' });
    }

    res.status(200).json(latestSnapshot);
  } catch (error) {
    console.error(`❌ Failed to fetch order book for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Internal server error while retrieving order book' });
  }
});

module.exports = router;
