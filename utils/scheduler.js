// utils/scheduler.js

const { startTradingSocket } = require('./trading.socket'); // WebSocket connection for real-time data
const redis = require('redis');
const { MongoClient } = require('mongodb');
const { saveTradeHistory, saveDepthHistory } = require('./historyStorage'); // Utility functions for saving history

// Redis client setup
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.error('Redis error:', err));

// MongoDB client setup (for saving historical data)
const mongoClient = new MongoClient('mongodb://localhost:27017');
const dbName = 'cryptoExchange';
let db;

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db(dbName);
    console.log('MongoDB connected for history storage');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

// Time interval for background tasks (e.g., saving periodic history)
const INTERVAL_MS = 60000; // 1 minute

async function startScheduler(io) {
  console.log('🕒 Bitget WebSocket API integration running...');

  // Start WebSocket connections for real-time updates (trade, orderbook, kline, ticker)
  startTradingSocket(io, redisClient);

  // Optionally, periodically save historical data to MongoDB every minute
  setInterval(async () => {
    console.log('⚙️ Running periodic task, e.g., syncing history to MongoDB...');
    
    // Fetch the latest historical data from Redis and save to MongoDB
    try {
      const tradeHistory = await redisClient.hgetall('tradeHistory');
      if (tradeHistory) {
        await saveTradeHistory(tradeHistory);
      }

      const orderBookHistory = await redisClient.hgetall('orderBookHistory');
      if (orderBookHistory) {
        await saveDepthHistory(orderBookHistory);
      }

    } catch (err) {
      console.error('Error fetching history data:', err);
    }
  }, INTERVAL_MS);
}

// Connect to MongoDB before starting the scheduler
connectMongoDB();

// Export the scheduler function
module.exports = { startScheduler };
