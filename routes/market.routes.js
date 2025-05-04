// routes/market.routes.js

const express = require('express');
const router = express.Router();
const Market = require('../models/Market');
const marketDataStore = require('../memory/marketdatastore');
const { getLivePriceFromWebSocket, getOrderBookFromWebSocket, getTradesFromWebSocket, getKlinesFromWebSocket } = require('../services/bitgetService');

// ✅ Fetch all market data stored in MongoDB (latest)
router.get('/markets', async (req, res) => {
  try {
    const marketData = await Market.find({}); // Get all market data from the database
    res.json(marketData);
  } catch (error) {
    console.error('❌ Error fetching market data:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// ✅ Fetch market data for a specific symbol (e.g., BTCUSDT)
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  try {
    // Check memory store first (if data is available)
    const livePriceData = marketDataStore.get(symbol);
    
    if (livePriceData) {
      return res.status(200).json(livePriceData); // Return live data from memory if available
    }

    // If not in memory, get from MongoDB (fallback)
    const data = await Market.findOne({ symbol });

    if (!data) {
      return res.status(404).json({ error: 'Market data not found for this symbol' });
    }

    res.json(data); // Return the symbol data from MongoDB
  } catch (error) {
    console.error(`❌ Error fetching data for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch symbol data' });
  }
});

// ✅ Fetch latest order book for a symbol
router.get('/orderbook/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  try {
    const orderBook = await getOrderBookFromWebSocket(symbol); // Get order book via WebSocket
    if (!orderBook) {
      return res.status(404).json({ error: 'Order book data not available for this symbol' });
    }
    res.json(orderBook); // Return live order book data
  } catch (error) {
    console.error(`❌ Error fetching order book for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch order book data' });
  }
});

// ✅ Fetch recent trades for a symbol
router.get('/trades/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  try {
    const trades = await getTradesFromWebSocket(symbol); // Get trades via WebSocket
    if (!trades) {
      return res.status(404).json({ error: 'Trade data not available for this symbol' });
    }
    res.json(trades); // Return live trade data
  } catch (error) {
    console.error(`❌ Error fetching trades for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch trade data' });
  }
});

// ✅ Fetch recent candlesticks (klines) for a symbol and interval
router.get('/klines/:symbol/:interval', async (req, res) => {
  const { symbol, interval } = req.params;

  try {
    const klines = await getKlinesFromWebSocket(symbol, interval); // Get klines via WebSocket
    if (!klines) {
      return res.status(404).json({ error: 'Kline data not available for this symbol' });
    }
    res.json(klines); // Return live kline data
  } catch (error) {
    console.error(`❌ Error fetching klines for ${symbol} with interval ${interval}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch kline data' });
  }
});

// ✅ Fetch live price for a symbol (from memory or WebSocket)
router.get('/price/:symbol', (req, res) => {
  const { symbol } = req.params;
  const data = marketDataStore.get(symbol.toUpperCase());

  if (!data) {
    return res.status(404).json({ message: 'No recent data for ' + symbol });
  }

  res.status(200).json(data);
});

module.exports = router;
