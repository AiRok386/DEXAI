// utils/marketUtils.js

const Market = require('../models/market.model');

async function saveOrUpdateMarketData(data) {
  try {
    const marketData = await Market.findOneAndUpdate(
      { symbol: data.symbol },
      { $set: data },
      { upsert: true, new: true }
    );
    return marketData;
  } catch (error) {
    console.error('❌ Error saving/updating market data:', error);
    throw error;
  }
}

module.exports = { saveOrUpdateMarketData };
