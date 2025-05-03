// utils/binanceUpdater.js

const axios = require('axios');
const MarketModel = require('../models/Market');

const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/24hr';

async function fetchAndUpdateBinanceData() {
  try {
    const response = await axios.get(BINANCE_API_URL);
    const marketDataArray = response.data;

    if (!Array.isArray(marketDataArray)) {
      console.error('Unexpected response from Binance API. Expected array.');
      return;
    }

    for (const data of marketDataArray) {
      const formattedData = {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        priceChangePercent: parseFloat(data.priceChangePercent),
        highPrice: parseFloat(data.highPrice),
        lowPrice: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
        quoteVolume: parseFloat(data.quoteVolume),
        openPrice: parseFloat(data.openPrice),
        closeTime: new Date(data.closeTime),
        updatedAt: new Date(),
      };

      await MarketModel.findOneAndUpdate(
        { symbol: formattedData.symbol },
        { $set: formattedData },
        { upsert: true, new: true }
      );
    }

    console.log(`✅ Updated ${marketDataArray.length} trading pairs from Binance.`);
  } catch (error) {
    console.error('❌ Error fetching/updating Binance market data:', error.message);
  }
}

function startBinanceUpdater(interval = 5000) {
  fetchAndUpdateBinanceData(); // initial run
  setInterval(fetchAndUpdateBinanceData, interval);
  console.log('🔁 Binance market data updater started (every', interval / 1000, 'seconds).');
}

module.exports = { startBinanceUpdater };
