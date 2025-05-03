// Jobs/dataUpdater.js

const axios = require('axios');
const Market = require('../models/Market'); // MongoDB model
const { topPairs } = require('../config/constants');

// In-memory market store (key: symbol, value: market data)
const marketCache = {};

async function updateMarketData() {
  console.log('🔄 Updating top 15 market data from Binance...');

  for (const symbol of topPairs) {
    try {
      const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr', {
        params: { symbol }
      });

      const data = res.data;
      const formatted = {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        priceChangePercent: parseFloat(data.priceChangePercent),
        highPrice: parseFloat(data.highPrice),
        lowPrice: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
        quoteVolume: parseFloat(data.quoteVolume),
        openPrice: parseFloat(data.openPrice),
        closeTime: new Date(data.closeTime),
        updatedAt: new Date()
      };

      // Save in memory
      marketCache[symbol] = formatted;

      // Save in MongoDB
      await Market.findOneAndUpdate(
        { symbol },
        { $set: formatted },
        { upsert: true }
      );
    } catch (err) {
      console.error(`❌ Failed to fetch ${symbol}:`, err.message);
    }
  }

  console.log('✅ Market data updated.');
}

// Schedule every 10 seconds
function startUpdater() {
  updateMarketData(); // initial fetch
  setInterval(updateMarketData, 10000);
}

module.exports = {
  startUpdater,
  getMarketCache: () => marketCache
};
