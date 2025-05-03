// routes/orderbook.routes.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/orderbook/:symbol?limit=50
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { limit = 50 } = req.query;

  try {
    const response = await axios.get('https://api.binance.com/api/v3/depth', {
      params: {
        symbol: symbol.toUpperCase(),
        limit,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(`❌ Error fetching order book for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch order book data' });
  }
});

module.exports = router;
