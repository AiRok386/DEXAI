// controllers/marketController.js (Bitget WebSocket version)

const Market = require('../models/Market');
const OrderBook = require('../models/OrderBook');
const Trade = require('../models/Trade');
const Kline = require('../models/Kline');

// Get all market data stored from Bitget WebSocket
async function getAllMarkets(req, res) {
  try {
    const markets = await Market.find({});
    res.json(markets);
  } catch (error) {
    console.error('❌ Error fetching markets:', error);
    res.status(500).json({ error: '❌ Could not fetch markets' });
  }
}

// Get the latest order book snapshot
async function getOrderBook(req, res) {
  try {
    const book = await OrderBook.findOne().sort({ updatedAt: -1 });
    res.json(book);
  } catch (error) {
    console.error('❌ Error fetching order book:', error);
    res.status(500).json({ error: '❌ Could not fetch order book' });
  }
}

// Get recent trades
async function getTrades(req, res) {
  try {
    const trades = await Trade.find().sort({ timestamp: -1 }).limit(100);
    res.json(trades);
  } catch (error) {
    console.error('❌ Error fetching trades:', error);
    res.status(500).json({ error: '❌ Could not fetch trades' });
  }
}

// Get recent candlesticks (klines)
async function getKlines(req, res) {
  try {
    const klines = await Kline.find().sort({ openTime: -1 }).limit(100);
    res.json(klines);
  } catch (error) {
    console.error('❌ Error fetching klines:', error);
    res.status(500).json({ error: '❌ Could not fetch klines' });
  }
}

module.exports = {
  getAllMarkets,
  getOrderBook,
  getTrades,
  getKlines
};
