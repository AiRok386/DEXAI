// controllers/marketController.js

const Market = require('../models/Market');  // Ensure you're importing the correct model
const fetchBinanceMarkets = require('../utils/fetchBinanceMarkets');  // This is a helper function to fetch Binance market data

// This function will update all the market data from Binance
async function updateAllMarkets(req, res) {
  try {
    // Fetch the latest market data from Binance
    const data = await fetchBinanceMarkets();

    // Create an array of promises for updating the database
    const updates = data.map(async (item) => {
      // Match the symbol against common asset pairs like USDT, BTC, ETH, BNB
      const symbolParts = item.symbol.match(/^([A-Z]+)(USDT|BTC|ETH|BUSD|BNB)$/); // regex to match asset pairs
      if (!symbolParts) return;

      const base = symbolParts[1];  // The base asset (e.g., BTC)
      const quote = symbolParts[2];  // The quote asset (e.g., USDT)

      // Update or insert the market data for the symbol in the database
      await Market.findOneAndUpdate(
        { symbol: item.symbol },  // Find the market by symbol
        {
          symbol: item.symbol,  // Symbol like BTCUSDT, ETHUSDT
          baseAsset: base,  // Base asset like BTC
          quoteAsset: quote,  // Quote asset like USDT
          price: parseFloat(item.lastPrice),  // Price of the asset
          volume: parseFloat(item.volume),  // Trading volume
          priceChangePercent: parseFloat(item.priceChangePercent),  // 24h price change percentage
          highPrice: parseFloat(item.highPrice),  // 24h high price
          lowPrice: parseFloat(item.lowPrice),  // 24h low price
          openPrice: parseFloat(item.openPrice),  // Opening price
        },
        { upsert: true, new: true }  // Update or insert a new market record
      );
    });

    // Wait for all update promises to finish
    await Promise.all(updates);
    res.json({ message: '✅ Market data updated successfully from Binance.' });
  } catch (error) {
    // If there is any error, send a 500 response with error message
    console.error('❌ Error updating market data:', error);
    res.status(500).json({ error: '❌ Failed to update market data' });
  }
}

// This function fetches all the markets from the database and returns them
async function getAllMarkets(req, res) {
  try {
    // Fetch all the markets stored in the MongoDB database
    const markets = await Market.find({});
    res.json(markets);  // Return all the markets as a response
  } catch (error) {
    // If there is any error fetching the markets, send a 500 response with error message
    console.error('❌ Error fetching markets:', error);
    res.status(500).json({ error: '❌ Could not fetch markets' });
  }
}

module.exports = { updateAllMarkets, getAllMarkets };
