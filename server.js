const express = require('express');
const connectDB = require('./config/db.config.js');
const priceRoutes = require('./routes/price.routes');
const startScheduler = require('./utils/scheduler').startScheduler;  // Correctly import startScheduler
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('./middlewares/ratelimiter');
const ipBlocker = require('./middlewares/ipblocker');
require('dotenv').config();
const tradingRoutes = require('./routes/trade.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const tokenRoutes = require('./routes/token.routes');
const icoRoutes = require('./routes/ico.routes');
const tradesRoutes = require('./routes/trades');
const orderbookRoutes = require('./routes/orderbook');
const candlesRoutes = require('./routes/candles');
const adminBotRoutes = require('./routes/admin/bots');
const dbConnect = require('./config/db.config');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Create server
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// Import bots and price update functions
const { startBot } = require('./bots/marketMakerBot');
const { startPriceUpdater } = require('./utils/priceUpdater');

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(rateLimit);
app.use(ipBlocker);
app.use(morgan('combined'));

// API routes
app.use('/api', priceRoutes);
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
const botRoutes = require('./routes/bot.routes');
app.use('/api/bots', botRoutes);
const marketRoutes = require('./routes/market.routes');
app.use('/api/markets', marketRoutes);

// Make io globally available
app.set('io', io);
global.io = io;

// Handle client socket connections
io.on('connection', (socket) => {
  console.log('🛜 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start the server after DB connection
async function startServer() {
  try {
    await dbConnect();
    console.log('✅ MongoDB connected successfully.');

    // Start price updater, bot, and scheduler
    startPriceUpdater();  // Start the price updater for fetching prices
    startBot();           // Start the market maker bot
    startScheduler();     // Start the scheduler for CoinCap data fetching

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
}

startServer();
