const WebSocket = require('ws');
const { parseTradeData, parseOrderBookData, parseKlineMessage, parseMarketData } = require('../utils/parseHelpers');
const Trade = require('../models/Trade');
const OrderBook = require('../models/OrderBook');
const Kline = require('../models/Kline');
const Market = require('../models/Market');
const socketIO = require('socket.io');

// WebSocket URL for Bitget (updated)
const wsUrl = 'wss://ws.bitget.com/v2/ws/public';

// Trading pairs to track (can be dynamically modified)
const tradingPairs = [
  'BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'SOL-USDT', 'XRP-USDT',
  'DOGE-USDT', 'PEPE-USDT', 'SUI-USDT', 'ADA-USDT', 'TRX-USDT',
  'TON-USDT', 'LTC-USDT', 'AVAX-USDT', 'SHIB-USDT', 'DOT-USDT'
];

// Cache to store the most recent price for each pair
let priceCache = {};

// Create WebSocket server for Socket.IO
let io;
const createSocketServer = (server) => {
  io = socketIO(server);
  console.log('Socket.IO server running...');
};

// WebSocket client
let ws;

// Function to connect to the WebSocket
function connectWebSocket() {
  ws = new WebSocket(wsUrl);

  // When WebSocket connection opens
  ws.on('open', () => {
    console.log('Connected to Bitget WebSocket');

    // Subscribe to multiple channels: trade, orderbook, candle, ticker
    const subscribeMsg = {
      op: 'subscribe',
      args: [
        ...tradingPairs.map(pair => ({ instType: 'SPOT', channel: 'ticker', instId: pair })),
        ...tradingPairs.map(pair => ({ instType: 'SPOT', channel: 'depth', instId: pair })),
        ...tradingPairs.map(pair => ({ instType: 'SPOT', channel: 'trade', instId: pair })),
        ...tradingPairs.map(pair => ({ instType: 'SPOT', channel: 'candle1m', instId: pair }))
      ]
    };

    // Send subscription message to WebSocket
    ws.send(JSON.stringify(subscribeMsg));

    // Heartbeat to keep the connection alive
    setInterval(() => {
      ws.send('ping');
    }, 30000);
  });

  // Handle incoming WebSocket messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      // Handle trade messages
      if (message.action === 'snapshot' && message.data && message.data.length > 0) {
        const tickerData = message.data[0];
        priceCache[tickerData.instId] = parseFloat(tickerData.lastPr);

        // Save market data (price) to MongoDB
        const marketData = parseMarketData(tickerData);
        const newMarketData = new Market(marketData);
        newMarketData.save().catch(err => console.error('Error saving market data:', err));

        // Emit market data to frontend
        if (io) {
          io.emit('marketData', marketData);
        }
      }

      // Handle trade data messages
      if (message.arg?.channel === 'trade' && message.data) {
        const tradeData = parseTradeData(message.data);
        const newTrade = new Trade(tradeData);
        newTrade.save().catch(err => console.error('Error saving trade data:', err));

        // Emit trade data to frontend
        if (io) {
          io.emit('tradeData', tradeData);
        }
      }

      // Handle order book data messages
      if (message.arg?.channel === 'depth' && message.data) {
        const orderBookData = parseOrderBookData(message.data);
        const newOrderBook = new OrderBook(orderBookData);
        newOrderBook.save().catch(err => console.error('Error saving order book data:', err));

        // Emit order book data to frontend
        if (io) {
          io.emit('orderBookData', orderBookData);
        }
      }

      // Handle kline (candlestick) data messages
      if (message.arg?.channel === 'candle1m' && message.data) {
        const klineData = parseKlineMessage(message.data);
        const newKline = new Kline(klineData);
        newKline.save().catch(err => console.error('Error saving kline data:', err));

        // Emit kline data to frontend
        if (io) {
          io.emit('klineData', klineData);
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Handle WebSocket connection closure
  ws.on('close', () => {
    console.log('WebSocket connection closed. Reconnecting...');
    setTimeout(connectWebSocket, 5000);  // Reconnect after 5 seconds
  });
}

// Function to get the latest price from the cache
function getPrice(pair) {
  return priceCache[pair] || null;
}

// Start WebSocket connection
connectWebSocket();

module.exports = {
  connectWebSocket,
  createSocketServer,
  getPrice
};
