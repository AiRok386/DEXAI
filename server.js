// server.js — Crypto Exchange Backend using Bitget WebSocket API

require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const ipBlocker = require('./middlewares/ipblocker');
const WebSocket = require('ws');  // WebSocket for Bitget API

// Import all API route files
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

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

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
app.use('/api/trades', tradesRoutes);
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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully.');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// WebSocket connection to Bitget API
const connectWebSocket = () => {
  const bitgetWsUrl = process.env.BITGET_WS_URL;
  const wsClient = new WebSocket(bitgetWsUrl);

  wsClient.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket');
    
    // Subscribe to Bitget WebSocket channels (Order Book, Trades, Klines, Ticker)
    const subscribeMessage = JSON.stringify({
      "op": "subscribe",
      "args": [
        { "channel": "spot/orderBook", "instId": "BTC-USDT" },
        { "channel": "spot/trade", "instId": "BTC-USDT" },
        { "channel": "spot/kline", "instId": "BTC-USDT", "bar": "1m" },
        { "channel": "spot/ticker", "instId": "BTC-USDT" }
      ]
    });

    wsClient.send(subscribeMessage);
  });

  wsClient.on('message', (data) => {
    // Handle incoming WebSocket data
    const parsedData = JSON.parse(data);
    
    // Process order book, trades, kline, and ticker data here
    if (parsedData.arg?.channel === 'spot/orderBook') {
      console.log('Order Book Update:', parsedData);
      // Store order book data to MongoDB
    }
    if (parsedData.arg?.channel === 'spot/trade') {
      console.log('Trade Feed Update:', parsedData);
      // Store trade data to MongoDB
    }
    if (parsedData.arg?.channel === 'spot/kline') {
      console.log('Kline Update:', parsedData);
      // Store kline data to MongoDB
    }
    if (parsedData.arg?.channel === 'spot/ticker') {
      console.log('Ticker Update:', parsedData);
      // Store ticker data to MongoDB
    }
  });

  wsClient.on('close', () => {
    console.log('❌ Disconnected from Bitget WebSocket');
  });

  wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};

// Start WebSocket connection
connectWebSocket();

// Start backend server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
