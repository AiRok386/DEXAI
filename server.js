// ✅ Clean & Working server.js file for your Crypto Exchange backend

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('./middlewares/ratelimiter');
const ipBlocker = require('./middlewares/ipblocker');
require('dotenv').config();
const tradingRoutes = require('./routes/trade.routes');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// 🌐 Make io globally available
global.io = io;
app.set('io', io);

// ✅ Connect to MongoDB
dbConnect = require('./config/db.config');
dbConnect();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(rateLimit);
app.use(ipBlocker);
app.use(morgan('combined'));

// ✅ Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/trading', require('./routes/trade.routes'));
app.use('/api/tokens', require('./routes/token.routes'));
app.use('/api/ico', require('./routes/ico.routes'));
app.use('/api/trades', require('./routes/trades'));
app.use('/api/orderbook', require('./routes/orderbook'));
app.use('/api/candles', require('./routes/candles'));
app.use('/admin/bots', require('./routes/admin/bots'));

// ✅ Socket.io events
io.on('connection', (socket) => {
  console.log('🛜 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ✅ Start Market Maker Bot
const { startBot } = require('./bots/marketMakerBot');
startBot();

// ✅ Start Binance stream mirroring
require('./services/binanceMultiStream');

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
