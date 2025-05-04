// server.js — Crypto Exchange Backend using Bitget WebSocket API

require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const ipBlocker = require('./middlewares/ipblocker');

// Import all API route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const tradingRoutes = require('./routes/trade.routes');
const tokenRoutes = require('./routes/token.routes');
const icoRoutes = require('./routes/ico.routes');
const tradesRoutes = require('./routes/trade.routes');
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

// Connect to Bitget WebSocket after DB connection
const connectToBitget = require('./services/bitgetSocketService');

// Start backend server + Bitget connection
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully.');

    // Connect to Bitget WebSocket streams
    connectToBitget();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}
const connectOrderBookSocket = require('./services/bitgetOrderBookService');
connectOrderBookSocket();

// Boot the backend
const { startUpdater } = require('./Jobs/dataUpdater');

// Start updating market data
startUpdater();


startServer();
