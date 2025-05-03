// server.js (Optimized & error-handled backend with Binance REST API)

require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const ipBlocker = require('./middlewares/ipblocker');  // Custom IP blocker middleware
const { startBinanceUpdater } = require('./utils/binanceUpdater');  // In-memory market data fetcher
const { fetchAndStoreData } = require('./services/binanceDataService');  // Periodic data storage from Binance

// Routes for various parts of the app
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const tradingRoutes = require('./routes/trade.routes');
const tokenRoutes = require('./routes/token.routes');
const icoRoutes = require('./routes/ico.routes');
const tradesRoutes = require('./routes/trades.routes');
const orderbookRoutes = require('./routes/orderbook.routes');
const candlesRoutes = require('./routes/candles.routes');
const adminBotRoutes = require('./routes/admin/bots');
const botRoutes = require('./routes/bot.routes');
const marketRoutes = require('./routes/market.routes');

// Set up Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for reverse proxies like Render
app.set('trust proxy', 1);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(ipBlocker);  // Block suspicious IP addresses
app.use(morgan('combined'));  // Logging requests

// Apply rate-limiting to all API routes
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use('/api/', apiLimiter);  // Apply rate limit middleware globally

// API Routes
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

// Root Route (Check if the server is up)
app.get('/', (req, res) => {
  res.send('🟢 Backend with Binance Market Mirror is running');
});

// Connect MongoDB and start server
async function startServer() {
  try {
    // MongoDB connection
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully.');

    // Start in-memory Binance market updater
    startBinanceUpdater();  // Periodically fetch and update market data

    // Start periodic data fetch for DB storage (every 10 seconds)
    fetchAndStoreData();
    setInterval(fetchAndStoreData, 10000);  // every 10s

    // Start express server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}

// Start the server
startServer();
