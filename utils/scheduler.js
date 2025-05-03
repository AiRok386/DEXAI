// utils/scheduler.js

const { fetchAndStoreMarketData } = require('./binanceMarketFetcher');

const INTERVAL_MS = 5000; // Every 5 seconds

function startScheduler() {
  console.log('🕒 Binance market data fetcher running every 5 seconds...');
  
  // Run once immediately on startup
  fetchAndStoreMarketData();

  // Schedule repeated fetching
  setInterval(fetchAndStoreMarketData, INTERVAL_MS);
}

module.exports = { startScheduler };
