const Token = require('../models/token.model');
const fetchCoinCapPrice = require('./fetchCoinCapPrice');

const UPDATE_INTERVAL = 30 * 1000; // 30 seconds

async function updateTokenPrices() {
  try {
    const tokens = await Token.find({ active: true });

    for (const token of tokens) {
      const price = await fetchCoinCapPrice(token.assetId); // assetId matches CoinCap (e.g. 'bitcoin', 'ethereum')
      if (price !== null) {
        token.currentPrice = price;
        await token.save();
        console.log(`✅ Updated ${token.symbol} price to $${price.toFixed(2)}`);
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
  setInterval(updateTokenPrices, UPDATE_INTERVAL);
  console.log('🔁 Token Price Updater started.');
}

module.exports = { startPriceUpdater };
