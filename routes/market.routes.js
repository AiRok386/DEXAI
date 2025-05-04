const express = require('express');
const router = express.Router();
const marketDataStore = require('../memory/marketdatastore'); // In-memory store for quick access
const {
  getLivePriceFromWebSocket,
  getOrderBookFromWebSocket,
  getTradesFromWebSocket,
  getKlinesFromWebSocket
} = require('../services/bitgetService'); // WebSocket helper methods from Bitget service

// ✅ Fetch all market data stored in MongoDB (latest)
router.get('/markets', async (req, res) => {
  try {
    // Assuming the Market model fetches all markets stored in MongoDB
    const marketData = await Market.find({}); 
    res.status(200).json(marketData);
  } catch (error) {
    console.error('❌ Error fetching market data:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// ✅ Fetch market data for a specific symbol (e.g., BTCUSDT)
// First checks in-memory data store, then MongoDB as a fallback
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  try {
    // Check memory store first (for faster access)
    const livePriceData = marketDataStore.get(symbol);
    
    if (livePriceData) {
      return res.status(200).json(livePriceData); // Return live data from memory store if available
    }

    // If not in memory, fall back to MongoDB
    const data = await Market.findOne({ symbol });

    if (!data) {
      return res.status(404).json({ error: 'Market data not found for this symbol' });
    }

    res.json(data); // Return symbol data from MongoDB
  } catch (error) {
    console.error(`❌ Error fetching data for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch symbol data' });
  }
});

// ✅ Fetch the latest order book for a symbol from Bitget WebSocket API
router.get('/orderbook/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  try {
    // Fetch live order book from WebSocket
    const orderBook = await getOrderBookFromWebSocket(symbol);

    if (!orderBook) {
      return res.status(404).json({ error: 'Order book data not available for this symbol' });
    }

    res.json(orderBook); // Return live order book data
  } catch (error) {
    console.error(`❌ Error fetching order book for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch order book data' });
  }
});

// ✅ Fetch the recent trades for a symbol from Bitget WebSocket API
router.get('/trades/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  try {
    // Fetch live trade data from WebSocket
    const trades = await getTradesFromWebSocket(symbol);

    if (!trades) {
      return res.status(404).json({ error: 'Trade data not available for this symbol' });
    }

    res.json(trades); // Return live trade data
  } catch (error) {
    console.error(`❌ Error fetching trades for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch trade data' });
  }
});

// ✅ Fetch recent candlesticks (klines) for a symbol and interval from Bitget WebSocket API
router.get('/klines/:symbol/:interval', async (req, res) => {
  const { symbol, interval } = req.params;

  try {
    // Fetch candlesticks (klines) from WebSocket
    const klines = await getKlinesFromWebSocket(symbol, interval);

    if (!klines) {
      return res.status(404).json({ error: 'Kline data not available for this symbol' });
    }

    res.json(klines); // Return live kline data
  } catch (error) {
    console.error(`❌ Error fetching klines for ${symbol} with interval ${interval}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch kline data' });
  }
});

// ✅ Fetch live price for a symbol from memory or WebSocket
router.get('/price/:symbol', async (req, res) => {
  const { symbol } = req.params;
  
  // Check memory store first (for faster access)
  const livePriceData = marketDataStore.get(symbol.toUpperCase());

  if (livePriceData) {
    return res.status(200).json(livePriceData); // Return live price data from memory store
  }

  // If not in memory, attempt to get live price via WebSocket
  try {
    const livePrice = await getLivePriceFromWebSocket(symbol);

    if (!livePrice) {
      return res.status(404).json({ message: 'Live price data not available for ' + symbol });
    }

    res.status(200).json(livePrice); // Return live price data from WebSocket
  } catch (error) {
    console.error(`❌ Error fetching live price for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch live price' });
  }
});

module.exports = router;
