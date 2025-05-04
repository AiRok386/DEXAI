require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const WebSocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const ipBlocker = require('./middlewares/ipblocker');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const tradingRoutes = require('./routes/trade.routes');
const tokenRoutes = require('./routes/token.routes');
const icoRoutes = require('./routes/ico.routes');
const tradeRoutes = require('./routes/trade.routes');
const orderbookRoutes = require('./routes/orderbook.routes');
const candlesRoutes = require('./routes/candles.routes');
const adminBotRoutes = require('./routes/admin/bots');
const botRoutes = require('./routes/bot.routes');
const marketRoutes = require('./routes/market.routes');

// WebSocket services (Bitget)
const connectBitgetTradeSocket = require('./services/bitgetTradeSocket');
const connectBitgetKlineSocket = require('./services/bitgetKlineSocket');
const connectBitgetOrderBookSocket = require('./services/bitgetOrderBookSocket');
const connectBitgetTickerSocket = require('./services/bitgetTickerSocket');

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-exchange';

// Middleware setup
app.set('trust proxy', 1); // For Render/NGINX reverse proxy support
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.use(ipBlocker); // Block bad IPs

// Rate limiter to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP
  message: 'Too many requests, please try again later.'
});
app.use('/api/', apiLimiter);

// All Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/ico', icoRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/orderbook', orderbookRoutes);
app.use('/api/candles', candlesRoutes);
app.use('/admin/bots', adminBotRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/market', marketRoutes);

// Root API Check
app.get('/', (req, res) => {
  res.send('🟢 Backend with Bitget Market Mirror is running');
});

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB connected successfully.');
    // Start the services after DB connection
    startPriceUpdater();         // Live price/volume updater
    startTradeStream(io);        // Real-time trade feed
    startOrderBookStream(io);    // Live order book
    startKlineStream(io);        // Candlestick/Kline updates
    startTickerStream(io);       // 24h price change/ticker updates
    createSocketServer(io);      // Start WebSocket server
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// WebSocket client for Bitget data streaming
function connectWebSocket() {
  const bitgetWsUrl = process.env.BITGET_WS_URL;
  const wsClient = new WebSocket(bitgetWsUrl);

  wsClient.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket');

    // Subscribe to Bitget WebSocket channels dynamically (for top tokens)
    subscribeToBitgetChannels(wsClient);
  });

  wsClient.on('message', (data) => {
    const parsedData = JSON.parse(data);

    // Handle different WebSocket channels (trade, orderbook, kline, ticker)
    if (parsedData.arg?.channel === 'spot/orderBook') {
      console.log('Order Book Update:', parsedData);
      io.emit('orderBookData', parsedData);
    }
    if (parsedData.arg?.channel === 'spot/trade') {
      console.log('Trade Feed Update:', parsedData);
      io.emit('tradeData', parsedData);
    }
    if (parsedData.arg?.channel === 'spot/kline') {
      console.log('Kline Update:', parsedData);
      io.emit('klineData', parsedData);
    }
    if (parsedData.arg?.channel === 'spot/ticker') {
      console.log('Ticker Update:', parsedData);
      io.emit('marketData', parsedData);
    }
  });

  wsClient.on('close', () => {
    console.log('❌ Disconnected from Bitget WebSocket');
  });

  wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

// Function to subscribe to channels (orderbook, trades, kline, ticker)
function subscribeToBitgetChannels(wsClient) {
  const tokens = ['BTC-USDT', 'ETH-USDT', 'XRP-USDT', 'LTC-USDT', 'BCH-USDT', 'SOL-USDT', 'DOT-USDT', 'ADA-USDT', 'DOGE-USDT', 'SHIB-USDT', 'MATIC-USDT', 'LUNA-USDT', 'AVAX-USDT', 'LINK-USDT', 'TRX-USDT'];

  tokens.forEach((symbol) => {
    wsClient.send(JSON.stringify({
      op: 'subscribe',
      args: [{ channel: `spot/orderBook`, instId: symbol }],  // Orderbook
    }));

    wsClient.send(JSON.stringify({
      op: 'subscribe',
      args: [{ channel: `spot/trade`, instId: symbol }],       // Trades
    }));

    wsClient.send(JSON.stringify({
      op: 'subscribe',
      args: [{ channel: `spot/kline`, instId: symbol, bar: '1m' }], // Kline
    }));

    wsClient.send(JSON.stringify({
      op: 'subscribe',
      args: [{ channel: `spot/ticker`, instId: symbol }],      // Ticker
    }));
  });
}

// Socket.IO server setup to send data to clients
function createSocketServer(io) {
  io.on('connection', (socket) => {
    console.log('Client connected to WebSocket');

    // Here you can listen to specific events from clients if needed
    socket.on('disconnect', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
}

// Start the price updater function (replaces previous example)
const { startPriceUpdater } = require('./utils/priceUpdater');
startPriceUpdater();
