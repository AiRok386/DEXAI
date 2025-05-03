// services/binanceService.js

const axios = require('axios');
const MarketModel = require('../models/Market');

// In-memory cache for top 15 market data
const inMemoryMarketData = new Map();

// Define the top 15 symbols you want to track
const TRACKED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT', 'LTCUSDT'
];

// Helper to fetch 24hr ticker stats
const fetchTickerData = async () => {
  const url = 'https://api.binance.com/api/v3/ticker/24hr';

  try {
    const response = await axios.get(url);
    return response.data.filter(item => TRACKED_SYMBOLS.includes(item.symbol));
  } catch (error) {
    console.error('❌ Error fetching 24hr ticker data:', error.message);
    return [];
  }
};

// Fetch and update in-memory + database
const fetchAndStoreData = async () => {
  const tickerData = await fetchTickerData();

  for (const data of tickerData) {
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

    // ✅ Update in-memory cache
    inMemoryMarketData.set(data.symbol, formatted);

    // ✅ Store in MongoDB (upsert)
    try {
      await MarketModel.findOneAndUpdate(
        { symbol: data.symbol },
        { $set: formatted },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`❌ MongoDB update failed for ${data.symbol}:`, err.message);
    }
  }

  console.log(`✅ Synced ${tickerData.length} pairs from Binance.`);
};

// Expose memory data for API routes
const getMarketDataFromMemory = () => {
  return Array.from(inMemoryMarketData.values());
};

module.exports = {
  fetchAndStoreData,
  getMarketDataFromMemory
};
