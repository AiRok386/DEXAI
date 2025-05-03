// utils/marketUtils.js

async function saveOrUpdateMarketData(data) {
  try {
    // Your logic to save or update market data in MongoDB
    const marketData = await MarketModel.findOneAndUpdate(
      { symbol: data.symbol }, // or use appropriate filter criteria
      { $set: data },
      { upsert: true, new: true }
    );
    return marketData;
  } catch (error) {
    console.error('Error saving/updating market data:', error);
    throw error;
  }
}

module.exports = { saveOrUpdateMarketData };
