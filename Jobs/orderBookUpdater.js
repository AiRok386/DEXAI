// Jobs/orderBookUpdater.js

const WebSocket = require('ws');
const OrderBook = require('../models/OrderBook');
const { topPairs } = require('../config/constants'); // Lowercase: ['btcusdt', 'ethusdt', ...]

// In-memory cache (optional)
const orderBookCache = {};

// Convert topPairs to Bitget's format: BTCUSDT → btcusdt_spot
const bitgetSymbols = topPairs.map(pair => `${pair}_spbl`);

// Bitget WebSocket URL
const bitgetWSUrl = 'wss://ws.bitget.com/spot/v1/stream';

// Start WebSocket connection
function startOrderBookUpdater() {
  const ws = new WebSocket(bitgetWSUrl);

  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket (OrderBook)...');

    // Subscribe to depth data for each trading pair
    const subscribeMsg = {
      op: 'subscribe',
      args: bitgetSymbols.map(symbol => ({
        channel: `depth5`,
        instId: symbol
      }))
    };

    ws.send(JSON.stringify(subscribeMsg));
  });

  ws.on('message', async (data) => {
    const parsed = JSON.parse(data);

    if (parsed?.event === 'error') {
      console.error('❌ Subscription error:', parsed);
      return;
    }

    if (parsed?.action === 'snapshot' && parsed?.arg?.channel === 'depth5') {
      const { arg, data: [orderData] } = parsed;

      const symbol = arg.instId.replace('_spbl', '').toUpperCase(); // Format: btcusdt → BTCUSDT

      const formattedOrderBook = {
        symbol,
        bids: orderData.bids.map(([price, qty]) => ({ price: parseFloat(price), quantity: parseFloat(qty) })),
        asks: orderData.asks.map(([price, qty]) => ({ price: parseFloat(price), quantity: parseFloat(qty) })),
        ts: new Date(parseInt(orderData.ts)),
        checksum: orderData.checksum
      };

      // Optional: store in memory
      orderBookCache[symbol] = formattedOrderBook;

      // Save to MongoDB
      try {
        await OrderBook.findOneAndUpdate(
          { symbol },
          { $set: formattedOrderBook },
          { upsert: true, new: true }
        );
        console.log(`✅ Order book updated: ${symbol}`);
      } catch (err) {
        console.error(`❌ DB update error (${symbol}):`, err.message);
      }
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ WebSocket closed. Reconnecting in 5s...');
    setTimeout(startOrderBookUpdater, 5000);
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
  });
}

module.exports = startOrderBookUpdater;
