const connectDB = require('./config/db.config'); // ⭐ Import MongoDB connection
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/user.routes');

app.use('/api/user', userRoutes);
const walletRoutes = require('./routes/wallet.routes');

app.use('/api/wallet', walletRoutes);
const tradingRoutes = require('./routes/trading.routes');

app.use('/api/trading', tradingRoutes);
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const iO = new Server(server, { cors: { origin: "*" } });

global.io = io; // ⭐ Save global io

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Replace app.listen() with:
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const tokenRoutes = require('./routes/token.routes');

app.use('/api', tokenRoutes);
const icoRoutes = require('./routes/ico.routes');

app.use('/api', icoRoutes);
const apiLimiter = require('./middlewares/ratelimiter');

app.use(apiLimiter); // Apply to all API routes
const ipBlocker = require('./middlewares/ipblocker');

app.use(ipBlocker); // Block bad IPs before allowing request
const morgan = require('morgan');

// ⭐ Log every API request to console (or file)
app.use(morgan('combined'));
const http = require('http');
const { Server } = require('socket.io');


const io = new Server(server, {
    cors: {
        origin: "*", // Allow frontend domain
    }
});

// ⭐ Make io available everywhere
app.set('io', io);

// ⭐ Socket connection
io.on('connection', (socket) => {
    console.log('🛜 New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// ⭐ Listen server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const { startBot, stopBot } = require('./bots/marketMakerBot');

// ➡️ Start bot automatically when server runs
startBot();
const botRoutes = require('./routes/admin/bots');

app.use('/admin/bots', botRoutes);
const http = require('http');
const socketio = require('socket.io');
const app = require('./app'); // your express app
const SERVER = http.createserver(app);
const Io = socketio(server,{
    cors: {
        origin: '*',  // Allow all frontend domains for now
        methods: ['GET', 'POST']
    }
});

// Export io globally
global.io = io;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const Server = http.createServer(app);

// ✅ Initialize socket.io server
const IO = socketIO(server, {
  cors: { origin: '*' },
});

// Export for use in other backend files
module.exports = io;

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
require('./services/binanceMultiStream'); // Load stream logic
const express = require('express');
const App = express();

// Other middlewares...

// Trades API
const tradesRoute = require('./routes/trades');
app.use('/api/trades', tradesRoute);
const orderBookRoute = require('./routes/orderbook');
app.use('/api/orderbook', orderBookRoute);
const candleRoute = require('./routes/candles');
app.use('/api/candles', candleRoute);
