// utils/binanceMarketFetcher.js

const axios = require('axios');
const Market = require('../models/Market');

const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/24hr';

async function fetchAndStoreMarketData() {
  try {
    const response = await axios.get(BINANCE_API_URL);
    const markets = response.data;

    for (const market of markets) {
      const marketData = {
        symbol: market.symbol,
        price: parseFloat(market.lastPrice),
        volume: parseFloat(market.volume),
        quoteVolume: parseFloat(market.quoteVolume),
        open: parseFloat(market.openPrice),
        high: parseFloat(market.highPrice),
        low: parseFloat(market.lowPrice),
        changePercent: parseFloat(market.priceChangePercent),
      };

      // Save or update the market data in MongoDB
      await Market.findOneAndUpdate(
        { symbol: marketData.symbol },
        { $set: marketData },
        { upsert: true, new: true }
      );
    }

    console.log(`✅ Binance market data fetched and stored (${markets.length} pairs)`);
  } catch (error) {
    console.error('❌ Error fetching/storing Binance market data:', error.message);
  }
}

module.exports = { fetchAndStoreMarketData };
