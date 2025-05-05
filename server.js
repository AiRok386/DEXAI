require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const ipBlocker = require('./middlewares/ipblocker');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const tradingRoutes = require('./routes/trade.routes');
const tokenRoutes = require('./routes/token.routes');
const icoRoutes = require('./routes/ico.routes');
const orderbookRoutes = require('./routes/orderbook.routes');
const candlesRoutes = require('./routes/candles.routes');
const adminBotRoutes = require('./routes/admin/bots');
const botRoutes = require('./routes/bot.routes');
const marketRoutes = require('./routes/market.routes');
const tickerRoutes = require('./routes/ticker.routes');

// WebSocket service connections (only once)
const connectBitgetTradeSocket = require('./sockets/bitget.trade.socket');
const connectBitgetOrderBookSocket = require('./sockets/bitget.orderbook.socket');
const connectBitgetTickerSocket = require('./sockets/bitget.ticker.socket');
const connectBitgetKlineSocket = require('./sockets/bitget.kline.socket');

// Price updater (optional utility)
const { startPriceUpdater } = require('./utils/priceUpdater');

// Initialize Express and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-exchange';

// Middleware
app.set('trust proxy', 1);
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.use(ipBlocker);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', apiLimiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/ico', icoRoutes);
app.use('/api/orderbook', orderbookRoutes);
app.use('/api/candles', candlesRoutes);
app.use('/admin/bots', adminBotRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ticker', tickerRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🟢 Backend with Bitget Market Mirror is running');
});

// MongoDB connection and WebSocket setup
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully.');

  // Start WebSocket data streams
  startPriceUpdater();
  connectBitgetTradeSocket();
  connectBitgetKlineSocket();
  connectBitgetOrderBookSocket();
  connectBitgetTickerSocket();

  // Setup client socket connections
  createSocketServer(io);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Socket.io listener
function createSocketServer(io) {
  io.on('connection', (socket) => {
    console.log('📡 Client connected');
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected');
    });
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
