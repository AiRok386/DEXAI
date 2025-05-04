const express = require('express');
const router = express.Router();
const redis = require('redis');
const { promisify } = require('util');
const axios = require('axios');
const WebSocket = require('ws');
const OrderBook = require('../models/OrderBook');

// Redis client setup
const redisClient = redis.createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.setex).bind(redisClient); // with expiry

// WebSocket URL for Bitget's Spot API
const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// WebSocket connection to Bitget
const ws = new WebSocket(BITGET_WS_URL);

// Allowed top 15 trading pairs
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

// Store order book data temporarily
let orderBooksCache = {};

// Listen for WebSocket messages from Bitget
ws.on('open', () => {
  console.log('Connected to Bitget WebSocket');
  // Subscribe to the top 15 symbols for order book data
  allowedSymbols.forEach(symbol => {
    ws.send(JSON.stringify({
      op: 'subscribe',
      args: [`spot/orderbook:${symbol}`],
    }));
  });
});

// Handle incoming WebSocket messages
ws.on('message', (message) => {
  const parsedMessage = JSON.parse(message);
  const { topic, data } = parsedMessage;

  // Handle the order book data
  if (topic && topic.startsWith('spot/orderbook:')) {
    const symbol = topic.split(':')[1];

    if (allowedSymbols.includes(symbol)) {
      const orderBookData = {
        symbol,
        bids: data.bids,
        asks: data.asks,
        lastUpdateId: data.lastUpdateId
      };

      // Update the cache and save it to Redis for quick access
      orderBooksCache[symbol] = orderBookData;
      setAsync(`orderbook:${symbol}`, 60, JSON.stringify(orderBookData)); // Cache for 60 seconds
    }
  }
});

// Route to get the latest order book for a specific symbol
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

    // 2. If not cached, check the in-memory cache
    if (orderBooksCache[symbol]) {
      return res.json(orderBooksCache[symbol]);
    }

    // 3. If no data found, return error
    return res.status(404).json({ error: 'Order book data not available' });
  } catch (error) {
    console.error(`❌ Failed to fetch order book for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Internal server error while retrieving order book' });
  }
});

// Route to get all order books
router.get('/', async (req, res) => {
  try {
    // Fetch all order book entries from the in-memory cache
    const allOrderBooks = Object.values(orderBooksCache);
    res.status(200).json(allOrderBooks);
  } catch (error) {
    console.error('❌ Error fetching all order books:', error);
    res.status(500).json({ error: '❌ Failed to fetch order books' });
  }
});

module.exports = router;
