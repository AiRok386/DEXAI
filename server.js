// server.js (Optimized & error-handled backend with Binance REST API)

require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('./middlewares/ratelimiter');
const ipBlocker = require('./middlewares/ipblocker');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const tradingRoutes = require('./routes/trade.routes');
const tokenRoutes = require('./routes/token.routes');
const icoRoutes = require('./routes/ico.routes');
const tradesRoutes = require('./routes/trades');
const orderbookRoutes = require('./routes/orderbook');
const candlesRoutes = require('./routes/candles');
const adminBotRoutes = require('./routes/admin/bots');
const botRoutes = require('./routes/bot.routes');
const marketRoutes = require('./routes/market.routes');

// In-memory market updater and Binance services
const { startBinanceUpdater } = require('./utils/binanceUpdater');
const { fetchAndStoreData } = require('./services/binanceDataService');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for reverse proxies like Render
app.set('trust proxy', 1);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(rateLimit);
app.use(ipBlocker);
app.use(morgan('combined'));

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

// Root Route
app.get('/', (req, res) => {
  res.send('🟢 Backend with Binance Market Mirror is running');
});

// Connect MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully.');

    // Start in-memory data fetcher & store
    startBinanceUpdater();

    // Start periodic data fetch for DB storage
    fetchAndStoreData();
    setInterval(fetchAndStoreData, 10000); // every 10s

    // Start express server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}
// Import routes
const candlesRoutes = require('./routes/candles.routes');
const orderbookRoutes = require('./routes/orderbook.routes');

// Use routes
app.use('/api/candles', candlesRoutes);
app.use('/api/orderbook', orderbookRoutes);
const tradesRoutes = require('./routes/trades.routes');
app.use('/api/trades', tradesRoutes);
startServer();
