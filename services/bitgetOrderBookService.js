// services/bitgetOrderBookService.js

const WebSocket = require('ws');
const Market = require('../models/Market'); // Your Mongoose model

const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// ✅ Symbols to subscribe (Bitget uses underscore notation like btc_usdt)
const symbols = ['btc_usdt', 'eth_usdt', 'sol_usdt']; // Add more as needed

// 📡 Subscribe to order book channel for each symbol
function subscribeToOrderBook(ws, symbol) {
  const subscribeMsg = {
    op: 'subscribe',
    args: [
      {
        channel: 'books',
        instId: symbol,
      },
    ],
  };
  ws.send(JSON.stringify(subscribeMsg));
}

// 📥 Handle incoming WebSocket messages
async function handleOrderBookMessage(message) {
  try {
    const parsed = JSON.parse(message);

    // ✅ Confirm subscription
    if (parsed.event === 'subscribe') {
      console.log(`📡 Subscribed to ${parsed.arg.instId}`);
      return;
    }

    // ✅ Process order book update
    if (parsed?.arg?.channel === 'books' && parsed?.data?.length) {
      const symbol = parsed.arg.instId.replace('_', '').toUpperCase(); // e.g., btc_usdt -> BTCUSDT
      const data = parsed.data[0];

      const topBids = (data.bids || []).slice(0, 10);
      const topAsks = (data.asks || []).slice(0, 10);

      // ✅ Save or update in MongoDB
      await Market.findOneAndUpdate(
        { symbol },
        {
          symbol,
          orderBook: {
            bids: topBids,
            asks: topAsks,
          },
        },
        { upsert: true }
      );

      console.log(`✅ Updated order book for ${symbol}`);
    }
  } catch (err) {
    console.error('❌ Failed to process order book message:', err.message);
  }
}

// 🔁 Start WebSocket connection and manage lifecycle
function startOrderBookService() {
  const ws = new WebSocket(BITGET_WS_URL);

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget WebSocket');
    symbols.forEach((symbol) => subscribeToOrderBook(ws, symbol));
  });

  ws.on('message', handleOrderBookMessage);

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
    ws.close(); // Close to trigger reconnect
  });

  ws.on('close', () => {
    console.warn('⚠️ WebSocket closed. Reconnecting in 5s...');
    setTimeout(startOrderBookService, 5000);
  });
}

module.exports = startOrderBookService;
