// utils/marketUtils.js

const MarketModel = require('../models/market.model'); // assuming you have a model to save the market data

async function saveOrUpdateMarketData(data) {
  try {
    // Save or update market data in MongoDB
    const marketData = await MarketModel.findOneAndUpdate(
      { symbol: data.symbol }, // use symbol or another identifier to find the existing record
      { $set: data }, // update the data
      { upsert: true, new: true } // create a new entry if not found
    );
    return marketData;
  } catch (error) {
    console.error('Error saving/updating market data:', error);
    throw error;
  }
}

module.exports = { saveOrUpdateMarketData };
