const express = require('express');
const router = express.Router();
const axios = require('axios');
const OrderBook = require('../models/OrderBook');

// List of allowed trading pairs (Top 15)
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!allowedSymbols.includes(symbol)) {
    return res.status(400).json({ error: 'Symbol not allowed' });
  }

  try {
    // Fetch the order book data from Binance API
    const response = await axios.get(`https://api.binance.com/api/v3/depth`, {
      params: {
        symbol: symbol,
        limit: 20 // You can adjust to 5, 10, 50, etc.
      }
    });

    // Prepare the data to be saved into MongoDB
    const orderBookData = {
      symbol,
      bids: response.data.bids,
      asks: response.data.asks,
      lastUpdateId: response.data.lastUpdateId
    };

    // Save the data to MongoDB
    const newOrderBook = new OrderBook(orderBookData);
    await newOrderBook.save();

    // Respond with the order book data
    res.json({
      symbol,
      bids: response.data.bids,
      asks: response.data.asks,
      lastUpdateId: response.data.lastUpdateId
    });

  } catch (error) {
    console.error('❌ Orderbook fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});
// routes/orderbook.js

const express = require('express');
const redis = require('redis');
const OrderBook = require('../models/OrderBook');

const redisClient = redis.createClient();
const router = express.Router();

// Endpoint to get the latest order book data for a specific symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    // Check Redis cache first
    const cachedOrderBook = await redisClient.getAsync(symbol);

    if (cachedOrderBook) {
      return res.json(JSON.parse(cachedOrderBook)); // Return cached data
    }

    // If not found in cache, fetch from MongoDB
    const orderBook = await OrderBook.findOne({ symbol });

    if (!orderBook) {
      return res.status(404).json({ message: 'Order book data not found for symbol.' });
    }

    return res.json(orderBook);
  } catch (error) {
    console.error('❌ Error fetching order book:', error.message);
    return res.status(500).json({ message: 'Failed to fetch order book data.' });
  }
});


module.exports = router;
