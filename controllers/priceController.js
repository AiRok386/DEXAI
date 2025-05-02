const Price = require('../models/Price');
const OrderBook = require('../models/OrderBook');
const { fetchMarketData } = require('../services/coinCapService');

// Dummy order book simulator
function generateOrderBook(price) {
  const bids = Array.from({ length: 5 }, (_, i) => [(price - i * 10).toFixed(2), (Math.random() * 5).toFixed(2)]);
  const asks = Array.from({ length: 5 }, (_, i) => [(price + i * 10).toFixed(2), (Math.random() * 5).toFixed(2)]);
  return { bids, asks };
}

async function updatePrices() {
  const data = await fetchMarketData();

  for (const asset of data) {
    const price = parseFloat(asset.priceUsd);

    const priceData = {
      symbol: asset.symbol.toLowerCase(),
      name: asset.name,
      price,
      volume: parseFloat(asset.volumeUsd24Hr),
      changePercent24Hr: parseFloat(asset.changePercent24Hr),
      updatedAt: new Date()
    };

    await Price.findOneAndUpdate(
      { symbol: priceData.symbol },
      priceData,
      { upsert: true }
    );

    const { bids, asks } = generateOrderBook(price);

    await OrderBook.findOneAndUpdate(
      { symbol: priceData.symbol },
      { symbol: priceData.symbol, bids, asks, updatedAt: new Date() },
      { upsert: true }
    );
  }

  console.log('🔁 Prices & Order Book Updated');
}

module.exports = { updatePrices };
