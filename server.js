// ✅ server.js
const express = require('express');
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
const { startBot } = require('./bots/marketMakerBot');
const dbConnect = require('./config/db.config');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// Make io globally available
app.set('io', io);
global.io = io;

// ✅ Wrap everything in async function to handle top-level await
async function startServer() {
  await dbConnect();

  app.use(cors());
  app.use(express.json());
  app.use(rateLimit);
  app.use(ipBlocker);
  app.use(morgan('combined'));

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

  io.on('connection', (socket) => {
    console.log('🛜 Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  startBot();
  require('./services/binanceMultiStream');

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();

const botRoutes = require('./routes/bot.routes');
app.use('/api/bots', botRoutes);

