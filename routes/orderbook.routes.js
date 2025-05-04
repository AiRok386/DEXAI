// routes/orderbook.routes.js

const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const WebSocket = require('ws');

const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

// In-memory cache for order books
let orderBooksCache = {};

// Redis client setup (v4+ with promises)
const redisClient = createClient();

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.connect(); // Async connection, but starts promise queue immediately

// WebSocket setup
const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
const ws = new WebSocket(BITGET_WS_URL);

ws.on('open', () => {
  console.log('✅ Connected to Bitget WebSocket');

  allowedSymbols.forEach(symbol => {
    ws.send(JSON.stringify({
      op: 'subscribe',
      args: [`spot/orderbook:${symbol}`],
    }));
  });
});

ws.on('message', async (message) => {
  try {
    const parsed = JSON.parse(message);
    const { topic, data } = parsed;

    if (topic && topic.startsWith('spot/orderbook:')) {
      const symbol = topic.split(':')[1];

      if (allowedSymbols.includes(symbol)) {
        const orderBookData = {
          symbol,
          bids: data?.bids || [],
          asks: data?.asks || [],
          lastUpdateId: data?.lastUpdateId || null,
        };

        // Update in-memory cache
        orderBooksCache[symbol] = orderBookData;

        // Save to Redis (60 seconds TTL)
        await redisClient.setEx(`orderbook:${symbol}`, 60, JSON.stringify(orderBookData));
      }
    }
  } catch (err) {
    console.error('❌ WebSocket message error:', err.message);
  }
});

// Route: Get latest order book by symbol
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!allowedSymbols.includes(symbol)) {
    return res.status(400).json({ error: 'Symbol not allowed' });
  }

  try {
    // Try Redis cache first
    const cached = await redisClient.get(`orderbook:${symbol}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Fallback to in-memory cache
    if (orderBooksCache[symbol]) {
      return res.json(orderBooksCache[symbol]);
    }

    return res.status(404).json({ error: 'Order book data not available' });
  } catch (err) {
    console.error(`❌ Failed to fetch order book for ${symbol}:`, err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get all available order books
router.get('/', async (req, res) => {
  try {
    const all = Object.values(orderBooksCache);
    return res.status(200).json(all);
  } catch (err) {
    console.error('❌ Error fetching all order books:', err.message);
    return res.status(500).json({ error: 'Failed to fetch order books' });
  }
});

module.exports = router;
