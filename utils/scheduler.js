// utils/scheduler.js

const { startTradingSocket } = require('./trading.socket'); // Assuming this starts your WebSocket connections

// Time interval in ms for other tasks (optional)
const INTERVAL_MS = 60000; // For tasks like cleanup or database syncing every minute

function startScheduler(io) {
  console.log('🕒 Bitget WebSocket API integration running...');

  // Start the WebSocket connection to get real-time market data
  startTradingSocket(io);

  // Optionally, you can add periodic tasks that run separately from the WebSocket (e.g., DB syncing)
  setInterval(() => {
    console.log('⚙️ Running periodic task, e.g., database sync...');
    // Your periodic tasks can go here (e.g., data cleanup or storage syncing)
  }, INTERVAL_MS);
}

module.exports = { startScheduler };
