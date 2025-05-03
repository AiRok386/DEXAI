const Token = require('../models/token.model');
const fetchBinanceData = require('./fetchBinanceData');

const UPDATE_INTERVAL = 5000; // 5 seconds

async function updateTokenPrices() {
  try {
    const tokens = await Token.find({ active: true });

    for (const token of tokens) {
      const data = await fetchBinanceData(token.symbol); // e.g. BTCUSDT, ETHUSDT

      if (data !== null) {
        token.currentPrice = data.price;
        token.volume = data.volume;
        token.priceChangePercent = data.priceChangePercent;
        token.highPrice = data.highPrice;
        token.lowPrice = data.lowPrice;

        await token.save();

        console.log(`✅ Updated ${token.symbol} | Price: $${data.price} | Vol: ${data.volume}`);
      } else {
        console.warn(`⚠️ Skipped ${token.symbol} — data unavailable`);
      }
    }
  } catch (error) {
    console.error('❌ Error updating token prices:', error.message);
  }
}

function startPriceUpdater() {
  updateTokenPrices(); // Run immediately
  setInterval(updateTokenPrices, UPDATE_INTERVAL); // Then repeat
  console.log('🔁 Token Price Updater started.');
}

module.exports = { startPriceUpdater };
