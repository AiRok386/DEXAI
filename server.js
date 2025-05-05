require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Utils
const { getActiveTokens } = require('./utils/tokenList');
const { startPriceUpdater } = require('./utils/priceUpdater');

// Middlewares
const ipBlocker = require('./middlewares/ipblocker');

// Bitget WebSocket sockets
const { connectOrderBookSocket } = require('./bitget/bitgetOrderBookSocket');
const { connectTradeSocket } = require('./bitget/bitgetTradeSocket');
const { connectKlineSocket } = require('./bitget/bitgetKlineSocket');
const { connectTickerSocket } = require('./bitget/bitgetTickerSocket');

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

// Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware setup
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(ipBlocker);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Try again after 15 minutes.'
});
app.use('/api/', apiLimiter);

// Routes
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
  res.send('🟢 Crypto Exchange Backend with Bitget WebSockets is Live');
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-exchange';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected.');

  // Fetch active tokens before initializing sockets
  const tokens = await getActiveTokens();
  if (!tokens || tokens.length === 0) {
    console.warn('⚠️ No active tokens found. Skipping Bitget WebSocket initialization.');
    return;
  }

  console.log('🔔 Subscribing to Bitget WebSockets for:', tokens);

  // Start price updater & WebSocket streams
  startPriceUpdater();
  connectOrderBookSocket(tokens);
  connectTradeSocket(tokens);
  connectKlineSocket(tokens);
  connectTickerSocket(tokens);

  // Initialize WebSocket server
  initializeSocketServer(io);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Socket.IO logic
function initializeSocketServer(io) {
  io.on('connection', (socket) => {
    console.log('📡 WebSocket client connected');

    socket.on('disconnect', () => {
      console.log('❌ WebSocket client disconnected');
    });
  });
}

// Start HTTP server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
