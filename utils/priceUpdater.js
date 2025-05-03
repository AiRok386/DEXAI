const Token = require('../models/token.model');
const { saveOrUpdateMarketData } = require('./marketUtils');
const fetchCoinCapPrice = require('./fetchCoinCapPrice');

const UPDATE_INTERVAL = 30 * 1000; // 30 seconds

async function updateTokenPrices() {
  try {
    const tokens = await Token.find({ active: true });

    for (const token of tokens) {
      const price = await fetchCoinCapPrice(token.assetId);

      if (price !== null) {
        token.currentPrice = price;
        await token.save();

        console.log(`✅ Updated ${token.symbol} price to $${price.toFixed(2)}`);

        const marketData = {
          symbol: token.symbol + 'USDT', // Example format like BTCUSDT
          price: price,
          volume: token.volume || 0 // Optional: add more fields if needed
        };

        await saveOrUpdateMarketData(marketData);
      } else {
        console.warn(`⚠️ Skipped ${token.symbol} — price unavailable`);
      }
    }
  } catch (error) {
    console.error('❌ Error updating token prices:', error.message);
  }
}

function startPriceUpdater() {
  updateTokenPrices();
  setInterval(updateTokenPrices, UPDATE_INTERVAL);
  console.log('🔁 Token Price Updater started.');
}

module.exports = { startPriceUpdater };
