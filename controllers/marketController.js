// controllers/marketController.js

const Market = require('../models/Market');
const OrderBook = require('../models/OrderBook');
const Trade = require('../models/Trade');
const Kline = require('../models/Kline');
const marketDataStore = require('../memory/marketdatastore');

// ✅ Get all market tickers (from MongoDB)
const getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find({}).sort({ updatedAt: -1 });
    res.status(200).json(markets);
  } catch (error) {
    console.error('❌ Error fetching market data:', error);
    res.status(500).json({ error: 'Could not fetch market data' });
  }
};

// ✅ Get latest order book by symbol (from MongoDB)
const getOrderBook = async (req, res) => {
  const { symbol } = req.params;

  try {
    const book = await OrderBook.findOne({ symbol: symbol.toUpperCase() }).sort({ updatedAt: -1 });

    if (!book) {
      return res.status(404).json({ message: `No order book found for ${symbol}` });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(`❌ Error fetching order book for ${symbol}:`, error);
    res.status(500).json({ error: 'Could not fetch order book' });
  }
};

// ✅ Get recent trades by symbol (from MongoDB)
const getTrades = async (req, res) => {
  const { symbol } = req.params;

  try {
    const trades = await Trade.find({ symbol: symbol.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json(trades);
  } catch (error) {
    console.error(`❌ Error fetching trades for ${symbol}:`, error);
    res.status(500).json({ error: 'Could not fetch trades' });
  }
};

// ✅ Get recent klines by symbol and interval (from MongoDB)
const getKlines = async (req, res) => {
  const { symbol, interval } = req.params;

  try {
    const klines = await Kline.find({
      symbol: symbol.toUpperCase(),
      interval
    })
      .sort({ openTime: -1 })
      .limit(100);

    res.status(200).json(klines);
  } catch (error) {
    console.error(`❌ Error fetching klines for ${symbol}:`, error);
    res.status(500).json({ error: 'Could not fetch klines' });
  }
};

// ✅ Get latest live price for a symbol (from in-memory store)
const getLivePrice = (req, res) => {
  const { symbol } = req.params;
  const data = marketDataStore.get(symbol.toUpperCase());

  if (!data) {
    return res.status(404).json({ message: `No recent price for ${symbol}` });
  }

  res.status(200).json(data);
};

module.exports = {
  getAllMarkets,
  getOrderBook,
  getTrades,
  getKlines,
  getLivePrice
};
