const axios = require('axios');
const MarketSnapshot = require('../models/MarketSnapshot');
const topPairs = require('../config/topPairs');

const cache = {}; // In-memory data

async function fetchAndStoreData() {
  try {
    const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const filtered = res.data.filter(t => topPairs.includes(t.symbol));

    for (const item of filtered) {
      const data = {
        symbol: item.symbol,
        price: parseFloat(item.lastPrice),
        volume: parseFloat(item.volume),
        priceChangePercent: parseFloat(item.priceChangePercent),
        highPrice: parseFloat(item.highPrice),
        lowPrice: parseFloat(item.lowPrice),
        timestamp: new Date()
      };

      // Store in memory
      cache[item.symbol] = data;

      // Store in MongoDB
      await MarketSnapshot.create(data);
    }

    console.log('✅ Updated Binance data for top pairs');
  } catch (err) {
    console.error('❌ Binance data fetch error:', err.message);
  }
}

function getMemoryData() {
  return cache;
}

module.exports = {
  fetchAndStoreData,
  getMemoryData
};
