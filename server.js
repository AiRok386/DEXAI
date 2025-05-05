require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Middlewares
const ipBlocker = require('./middlewares/ipblocker');

// Routes
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

// Bitget WebSocket connections (run once)
const connectBitgetTradeSocket = require('./sockets/bitget.trade.socket');
const connectBitgetOrderBookSocket = require('./sockets/bitget.orderbook.socket');
const connectBitgetTickerSocket = require('./sockets/bitget.ticker.socket');
const connectBitgetKlineSocket = require('./sockets/bitget.kline.socket');

// Price updater
const { startPriceUpdater } = require('./utils/priceUpdater');

// Init Express app and server
const app = express();
const server = http.createServer(app);

// Init Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Environment configs
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-exchange';

// Apply middlewares
app.set('trust proxy', 1); // For rate limiting behind proxies
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(ipBlocker);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', apiLimiter);

// API route handlers
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

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully.');

  // Start Bitget WebSocket data feeds
  startPriceUpdater();
  connectBitgetTradeSocket();
  connectBitgetOrderBookSocket();
  connectBitgetKlineSocket();
  connectBitgetTickerSocket();

  // Start Socket.IO server for frontend clients
  initializeSocketServer(io);
})
.catch((error) => {
  console.error('❌ Failed to connect to MongoDB:', error.message);
  process.exit(1);
});

// Function to initialize client socket events
function initializeSocketServer(io) {
  io.on('connection', (socket) => {
    console.log('📡 Client connected via WebSocket');

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected');
    });
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
