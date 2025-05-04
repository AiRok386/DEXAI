// controllers/marketController.js

const Market = require('../models/Market');
const OrderBookSnapshot = require('../models/OrderBookSnapshot');
const Trade = require('../models/Trade');
const Kline = require('../models/Kline');
const marketDataStore = require('../memory/marketdatastore');
const WebSocket = require('ws');

// WebSocket URL for Bitget
const WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt']; // Symbols to track
const INTERVAL = '1m'; // Interval for Klines (1 minute)

const ws = new WebSocket(WS_URL);

// Subscribe to Kline and Order Book data for each symbol
function subscribeToBitget(ws) {
  SYMBOLS.forEach(symbol => {
    const klinePayload = {
      op: 'subscribe',
      args: [
        {
          instType: 'SPOT',
          channel: 'candle',
          instId: symbol.toUpperCase(),
          bar: INTERVAL,
        },
      ],
    };
    ws.send(JSON.stringify(klinePayload));
    console.log(`📡 Subscribed to Kline feed: ${symbol.toUpperCase()} at ${INTERVAL}`);

    const orderBookPayload = {
      op: 'subscribe',
      args: [
        {
          instType: 'SPOT',
          channel: 'book',
          instId: symbol.toUpperCase(),
        },
      ],
    };
    ws.send(JSON.stringify(orderBookPayload));
    console.log(`📡 Subscribed to Order Book feed: ${symbol.toUpperCase()}`);
  });
}

// Handle Kline (candlestick) messages and save to MongoDB
function handleKlineMessage(msg) {
  const { arg, data } = msg;
  if (!arg || !data || !Array.isArray(data) || data.length === 0) return;

  const symbol = arg.instId.toUpperCase();
  const kline = data[0];
  const klineData = {
    symbol,
    openTime: new Date(kline.ts),
    open: parseFloat(kline.o),
    close: parseFloat(kline.c),
    high: parseFloat(kline.h),
    low: parseFloat(kline.l),
    volume: parseFloat(kline.v),
    interval: arg.bar,
  };

  const newKline = new Kline(klineData);
  newKline.save().catch(err => {
    console.error(`❌ Failed to save kline for ${symbol}:`, err.message);
  });
}

// Handle Order Book messages and save to MongoDB
function handleOrderBookMessage(msg) {
  const { arg, data } = msg;
  if (!arg || !data || !Array.isArray(data) || data.length === 0) return;

  const symbol = arg.instId.toUpperCase();
  const orderBookData = {
    symbol,
    bids: data[0].bids.map(bid => [parseFloat(bid[0]), parseFloat(bid[1])]),
    asks: data[0].asks.map(ask => [parseFloat(ask[0]), parseFloat(ask[1])]),
    timestamp: new Date(),
  };

  const newOrderBook = new OrderBookSnapshot(orderBookData);
  newOrderBook.save().catch(err => {
    console.error(`❌ Failed to save order book for ${symbol}:`, err.message);
  });
}

// Handle incoming WebSocket messages
ws.on('open', () => {
  console.log('🔌 Connected to Bitget WebSocket');
  subscribeToBitget(ws);
});

ws.on('message', (msg) => {
  try {
    const data = JSON.parse(msg);
    if (data.event === 'error') {
      console.error('❌ Bitget error:', data);
    } else if (data.arg?.channel?.includes('candle') && data.data) {
      handleKlineMessage(data);
    } else if (data.arg?.channel?.includes('book') && data.data) {
      handleOrderBookMessage(data);
    }
  } catch (err) {
    console.error('❌ Failed to parse Bitget message:', err.message);
  }
});

ws.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', () => {
  console.warn('🔌 WebSocket closed. Reconnecting in 5s...');
  setTimeout(() => new WebSocket(WS_URL), 5000); // Reconnect if the WebSocket closes
});

// Get all market tickers (from MongoDB)
const getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find({}).sort({ updatedAt: -1 });
    res.status(200).json(markets);
  } catch (error) {
    console.error('❌ Error fetching market data:', error);
    res.status(500).json({ error: 'Could not fetch market data' });
  }
};

// Get latest order book by symbol (from MongoDB)
const getOrderBook = async (req, res) => {
  const { symbol } = req.params;

  try {
    const book = await OrderBookSnapshot.findOne({ symbol: symbol.toUpperCase() }).sort({ updatedAt: -1 });

    if (!book) {
      return res.status(404).json({ message: `No order book found for ${symbol}` });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(`❌ Error fetching order book for ${symbol}:`, error);
    res.status(500).json({ error: 'Could not fetch order book' });
  }
};

// Get recent trades by symbol (from MongoDB)
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

// Get recent klines by symbol and interval (from MongoDB)
const getKlines = async (req, res) => {
  const { symbol, interval } = req.params;

  try {
    const klines = await Kline.find({
      symbol: symbol.toUpperCase(),
      interval,
    })
      .sort({ openTime: -1 })
      .limit(100);

    res.status(200).json(klines);
  } catch (error) {
    console.error(`❌ Error fetching klines for ${symbol}:`, error);
    res.status(500).json({ error: 'Could not fetch klines' });
  }
};

// Get latest live price for a symbol (from in-memory store)
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
  getLivePrice,
};
