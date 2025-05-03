// routes/candles.routes.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/candles/:symbol?interval=1m&limit=100
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { interval = '1m', limit = 100 } = req.query;

  try {
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: symbol.toUpperCase(),
        interval,
        limit,
      },
    });

    const formattedData = response.data.map((kline) => ({
      openTime: kline[0],
      open: kline[1],
      high: kline[2],
      low: kline[3],
      close: kline[4],
      volume: kline[5],
      closeTime: kline[6],
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error(`❌ Error fetching Kline data for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch candlestick data' });
  }
});

module.exports = router;
