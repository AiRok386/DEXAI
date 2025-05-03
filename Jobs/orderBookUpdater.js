const axios = require('axios');
const OrderBook = require('../models/OrderBook');

// List of allowed trading pairs (Top 15)
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

async function fetchAndUpdateOrderBooks() {
  for (const symbol of allowedSymbols) {
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/depth`, {
        params: {
          symbol: symbol,
          limit: 20 // Limit to 20 bids/asks
        }
      });

      const orderBookData = {
        symbol,
        bids: response.data.bids,
        asks: response.data.asks,
        lastUpdateId: response.data.lastUpdateId
      };

      // Save to MongoDB
      const newOrderBook = new OrderBook(orderBookData);
      await newOrderBook.save();

      console.log(`✅ Order book for ${symbol} updated successfully.`);
    } catch (error) {
      console.error(`❌ Error updating order book for ${symbol}:`, error.message);
    }
  }
}

// Start the background job to update the order book every 10-15 seconds
function startOrderBookUpdater() {
  fetchAndUpdateOrderBooks(); // Initial fetch
  setInterval(fetchAndUpdateOrderBooks, 10000); // Every 10 seconds
  console.log('🔁 Order book updater started (every 10 seconds).');
}

try {
  // Attempt to fetch data from Binance API
  const response = await axios.get(`${BINANCE_API_URL}?symbol=${symbol}&limit=5`);
  const orderBookData = response.data;

  if (!orderBookData.bids || !orderBookData.asks) {
    throw new Error('Invalid order book data received from Binance');
  }

  const formattedData = {
    symbol,
    bids: orderBookData.bids,
    asks: orderBookData.asks,
    updatedAt: new Date(),
  };

  // Save to MongoDB
  await OrderBook.findOneAndUpdate(
    { symbol: formattedData.symbol },
    { $set: formattedData },
    { upsert: true, new: true }
  );

  // Cache data in Redis for 10 seconds
  redisClient.setex(symbol, 10, JSON.stringify(formattedData));

  console.log(`✅ Updated and cached order book for ${symbol}`);
} catch (error) {
  console.error(`❌ Error processing order book for ${symbol}:`, error.message);
}

module.exports = startOrderBookUpdater;
