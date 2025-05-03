// routes/orderbook.js

const express = require('express');
const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');
const OrderBook = require('../models/OrderBook');

const router = express.Router();

// Allowed top 15 trading pairs
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

// Redis client setup
const redisClient = redis.createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.setex).bind(redisClient); // with expiry

// GET /api/orderbook/:symbol
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!allowedSymbols.includes(symbol)) {
    return res.status(400).json({ error: 'Symbol not allowed' });
  }

  try {
    // 1. Check Redis cache first
    const cachedData = await getAsync(`orderbook:${symbol}`);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // 2. Fetch live data from Binance
    const response = await axios.get('https://api.binance.com/api/v3/depth', {
      params: { symbol, limit: 20 }
    });

    const orderBookData = {
      symbol,
      bids: response.data.bids,
      asks: response.data.asks,
      lastUpdateId: response.data.lastUpdateId
    };

    // 3. Save to MongoDB (overwrite if already exists)
    await OrderBook.findOneAndUpdate(
      { symbol },
      orderBookData,
      { upsert: true, new: true }
    );

    // 4. Save to Redis cache for 60 seconds
    await setAsync(`orderbook:${symbol}`, 60, JSON.stringify(orderBookData));

    // 5. Respond with fresh data
    res.json(orderBookData);

  } catch (error) {
    console.error(`❌ Failed to fetch order book for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch order book data' });
  }
});

module.exports = router;
