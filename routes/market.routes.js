const express = require('express');
const router = express.Router();
const marketDataStore = require('../memory/marketdatastore');
const Market = require('../models/Market'); // ✅ Make sure this path is correct

const {
  getLivePriceFromWebSocket,
  getOrderBookFromWebSocket,
  getTradesFromWebSocket,
  getKlinesFromWebSocket,
} = require('../services/bitgetService');

// ✅ Fetch all markets from MongoDB
router.get('/markets', async (req, res) => {
  try {
    const marketData = await Market.find({});
    res.status(200).json(marketData);
  } catch (error) {
    console.error('❌ Error fetching market data:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// ✅ Fetch specific market data from memory or MongoDB
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();

  try {
    const cached = marketDataStore.get(symbol);
    if (cached) return res.status(200).json(cached);

    const data = await Market.findOne({ symbol });
    if (!data) {
      return res.status(404).json({ error: 'Market data not found for this symbol' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(`❌ Error fetching data for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch symbol data' });
  }
});

// ✅ Get live order book
router.get('/orderbook/:symbol', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();

  try {
    const orderBook = await getOrderBookFromWebSocket(symbol);
    if (!orderBook) {
      return res.status(404).json({ error: 'Order book data not available' });
    }
    res.status(200).json(orderBook);
  } catch (error) {
    console.error(`❌ Error fetching order book for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch order book data' });
  }
});

// ✅ Get live trade data
router.get('/trades/:symbol', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();

  try {
    const trades = await getTradesFromWebSocket(symbol);
    if (!trades) {
      return res.status(404).json({ error: 'Trade data not available' });
    }
    res.status(200).json(trades);
  } catch (error) {
    console.error(`❌ Error fetching trades for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch trade data' });
  }
});

// ✅ Get klines for symbol and interval
router.get('/klines/:symbol/:interval', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();
  const interval = req.params.interval;

  try {
    const klines = await getKlinesFromWebSocket(symbol, interval);
    if (!klines) {
      return res.status(404).json({ error: 'Kline data not available' });
    }
    res.status(200).json(klines);
  } catch (error) {
    console.error(`❌ Error fetching klines for ${symbol} with interval ${interval}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch kline data' });
  }
});

// ✅ Get live price
router.get('/price/:symbol', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();

  try {
    const cached = marketDataStore.get(symbol);
    if (cached) return res.status(200).json(cached);

    const livePrice = await getLivePriceFromWebSocket(symbol);
    if (!livePrice) {
      return res.status(404).json({ message: 'Live price data not available' });
    }

    res.status(200).json(livePrice);
  } catch (error) {
    console.error(`❌ Error fetching live price for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch live price' });
  }
});

module.exports = router;
