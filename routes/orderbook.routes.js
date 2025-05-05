const express = require('express');
const router = express.Router();
const WebSocket = require('ws');

// Allowed trading pairs
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

// In-memory cache to store order book data
const orderBooksCache = {};

// Connect to Bitget WebSocket
const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
const ws = new WebSocket(BITGET_WS_URL);

ws.on('open', () => {
  console.log('✅ Connected to Bitget WebSocket for Order Books');

  allowedSymbols.forEach((symbol) => {
    ws.send(JSON.stringify({
      op: 'subscribe',
      args: [{
        channel: 'spot/orderBook',
        instId: symbol.replace('USDT', '-USDT')  // Format: BTCUSDT → BTC-USDT
      }]
    }));
  });
});

ws.on('message', (message) => {
  try {
    const parsed = JSON.parse(message);

    if (parsed?.arg?.channel === 'spot/orderBook') {
      const symbol = parsed.arg.instId.replace('-USDT', 'USDT');

      if (!allowedSymbols.includes(symbol)) return;

      orderBooksCache[symbol] = {
        symbol,
        bids: parsed.data?.bids || [],
        asks: parsed.data?.asks || [],
        ts: parsed.data?.ts || Date.now()
      };
    }
  } catch (err) {
    console.error('❌ Error parsing WebSocket order book message:', err.message);
  }
});

// GET /api/orderbook/:symbol → Get latest order book for a symbol
router.get('/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!allowedSymbols.includes(symbol)) {
    return res.status(400).json({ error: 'Symbol not supported' });
  }

  const orderBook = orderBooksCache[symbol];
  if (!orderBook) {
    return res.status(404).json({ error: 'Order book data not available yet' });
  }

  return res.json(orderBook);
});

// GET /api/orderbook → Get all available order books
router.get('/', (req, res) => {
  try {
    const allBooks = Object.values(orderBooksCache);
    return res.status(200).json(allBooks);
  } catch (err) {
    console.error('❌ Error returning all order books:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
