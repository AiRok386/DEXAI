// utils/binanceUpdater.js

const axios = require('axios');
const MarketModel = require('../models/Market');

// Top 15 trading pairs you want to track
const topSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'SHIBUSDT', 'AVAXUSDT', 'LINKUSDT', 'LTCUSDT'
];

// In-memory store for fast frontend access
const inMemoryMarketData = {};

// Fetch 24hr ticker data for top 15 symbols
async function fetchAndUpdateBinanceData() {
  try {
    for (const symbol of topSymbols) {
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
      const response = await axios.get(url);
      const data = response.data;

      const formattedData = {
        symbol: data.symbol,
        baseAsset: data.symbol.replace('USDT', ''),
        quoteAsset: 'USDT',
        price: parseFloat(data.lastPrice),
        priceChangePercent: parseFloat(data.priceChangePercent),
        highPrice: parseFloat(data.highPrice),
        lowPrice: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
        updatedAt: new Date()
      };

      // Save in memory
      inMemoryMarketData[symbol] = formattedData;

      // Save to MongoDB
      await MarketModel.findOneAndUpdate(
        { symbol },
        { $set: formattedData },
        { upsert: true, new: true }
      );
    }

    console.log(`✅ Updated ${topSymbols.length} pairs from Binance.`);
  } catch (error) {
    console.error('❌ Error fetching/updating Binance data:', error.message);
  }
}

// Start periodic updater
function startBinanceUpdater(interval = 10000) {
  fetchAndUpdateBinanceData(); // initial fetch
  setInterval(fetchAndUpdateBinanceData, interval);
  console.log(`🔁 Binance data updater started (every ${interval / 1000}s)`);
}

// To expose memory cache to routes
function getMarketDataFromMemory() {
  return inMemoryMarketData;
}

module.exports = {
  startBinanceUpdater,
  getMarketDataFromMemory
};
