const Token = require('../models/token.model');
const { saveOrUpdateMarketData } = require('./marketUtils'); // Import saveOrUpdateMarketData
const fetchCoinCapPrice = require('./fetchCoinCapPrice');

const UPDATE_INTERVAL = 30 * 1000; // 30 seconds

// Function to update token prices
async function updateTokenPrices() {
  try {
    const tokens = await Token.find({ active: true }); // Fetch all active tokens

    for (const token of tokens) {
      const price = await fetchCoinCapPrice(token.assetId); // Fetch live price using CoinCap API
      if (price !== null) {
        token.currentPrice = price; // Update the price on the token model
        await token.save(); // Save token with the new price in the database
        console.log(`✅ Updated ${token.symbol} price to $${price.toFixed(2)}`);

        // Now call saveOrUpdateMarketData to update the market data separately
        const marketData = {
          symbol: token.symbol,
          price: price,
          volume: token.volume || 0, // Assuming you have volume or other fields you need to update
        };
        await saveOrUpdateMarketData(marketData); // Save or update market data in the MongoDB
      } else {
        console.warn(`⚠️ Skipped ${token.symbol} — price unavailable`);
      }
    }
  } catch (error) {
    console.error('❌ Error updating token prices:', error.message);
  }
}

// Auto-run in background every X seconds
function startPriceUpdater() {
  updateTokenPrices(); // Run immediately once
  setInterval(updateTokenPrices, UPDATE_INTERVAL); // Run every 30 seconds
  console.log('🔁 Token Price Updater started.');
}

module.exports = { startPriceUpdater };
