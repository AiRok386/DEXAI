// routes/trades.routes.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/trades/:symbol?limit=10
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { limit = 10 } = req.query;

  try {
    const response = await axios.get('https://api.binance.com/api/v3/trades', {
      params: {
        symbol: symbol.toUpperCase(),
        limit,
      },
    });

    const trades = response.data.map(trade => ({
      id: trade.id,
      price: trade.price,
      qty: trade.qty,
      time: trade.time,
      isBuyerMaker: trade.isBuyerMaker,
    }));

    res.status(200).json(trades);
  } catch (error) {
    console.error(`❌ Error fetching trades for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch recent trades' });
  }
});

module.exports = router;

