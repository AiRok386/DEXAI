const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('./middlewares/ratelimiter');
const ipBlocker = require('./middlewares/ipblocker');
require('dotenv').config();  // This should not be causing issues
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

// ✅ Create Express app and server instance
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// 🌐 Make io globally available
global.io = io;
app.set('io', io);

// ✅ MongoDB connection
dbConnect();  // If dbConnect() is asynchronous, ensure it's properly handled

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(rateLimit);
app.use(ipBlocker);
app.use(morgan('combined'));

// ✅ Routes
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

// ✅ Socket.io events
io.on('connection', (socket) => {
    console.log('🛜 Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// ✅ Start Market Maker Bot
startBot();

// ✅ Start Binance stream mirroring
require('./services/binanceMultiStream');  // Ensure this file doesn't have top-level await

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
