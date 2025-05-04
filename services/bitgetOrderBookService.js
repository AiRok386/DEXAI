// services/bitgetOrderBookService.js

const WebSocket = require('ws');
const Market = require('../models/Market'); // Mongoose model for market data

const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// ✅ List of symbols to subscribe to (Bitget uses underscore notation like btc_usdt)
const symbols = ['btc_usdt', 'eth_usdt', 'sol_usdt']; // Add more pairs as needed

// 📡 Subscribe to order book and price stats channels for each symbol
function subscribeToChannels(ws, symbol) {
  // Subscribe to order book channel (bids and asks)
  const orderBookMsg = {
    op: 'subscribe',
    args: [
      {
        channel: 'books',
        instId: symbol,
      },
    ],
  };
  ws.send(JSON.stringify(orderBookMsg));

  // Subscribe to price stats channel (ticker data)
  const priceStatsMsg = {
    op: 'subscribe',
    args: [
      {
        channel: 'ticker',
        instId: symbol,
      },
    ],
  };
  ws.send(JSON.stringify(priceStatsMsg));
}

// 📥 Handle incoming WebSocket messages
async function handleWebSocketMessage(message) {
  try {
    const parsed = JSON.parse(message);

    // ✅ Process order book data (bids/asks)
    if (parsed?.arg?.channel === 'books' && parsed?.data?.length) {
      const symbol = parsed.arg.instId.replace('_', '').toUpperCase(); // e.g., btc_usdt -> BTCUSDT
      const data = parsed.data[0];

      const topBids = (data.bids || []).slice(0, 10); // Top 10 bids
      const topAsks = (data.asks || []).slice(0, 10); // Top 10 asks

      // ✅ Save or update order book in MongoDB
      await Market.findOneAndUpdate(
        { symbol },
        {
          symbol,
          orderBook: {
            bids: topBids.map(([price, quantity]) => ({ price: parseFloat(price), quantity: parseFloat(quantity) })),
            asks: topAsks.map(([price, quantity]) => ({ price: parseFloat(price), quantity: parseFloat(quantity) })),
          },
        },
        { upsert: true } // Insert if not exists, or update if exists
      );

      console.log(`✅ Order book updated for ${symbol}`);
    }

    // ✅ Process price stats data (24h price, volume, change, etc.)
    if (parsed?.arg?.channel === 'ticker' && parsed?.data?.length) {
      const symbol = parsed.arg.instId.replace('_', '').toUpperCase(); // e.g., btc_usdt -> BTCUSDT
      const data = parsed.data[0];

      // Update the price stats in MongoDB
      await Market.findOneAndUpdate(
        { symbol },
        {
          symbol,
          lastPrice: parseFloat(data.last),           // Last traded price
          high24h: parseFloat(data.high24h),           // High price in last 24h
          low24h: parseFloat(data.low24h),             // Low price in last 24h
          change24h: parseFloat(data.change24h),       // 24h change in price
          volume24h: parseFloat(data.vol24h),          // 24h trading volume
          priceChangePercent: parseFloat(data.changePercent), // 24h price change in percentage
          highPrice: parseFloat(data.highPrice),       // High price during the current session
          lowPrice: parseFloat(data.lowPrice),         // Low price during the current session
        },
        { upsert: true } // Insert if not exists, or update if exists
      );

      console.log(`✅ Price stats updated for ${symbol}`);
    }
  } catch (err) {
    console.error('❌ Failed to process WebSocket message:', err.message);
  }
}

// 🔁 Start WebSocket connection and manage lifecycle
function startOrderBookService() {
  const ws = new WebSocket(BITGET_WS_URL);

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget WebSocket');
    symbols.forEach((symbol) => subscribeToChannels(ws, symbol)); // Subscribe to all symbols
  });

  ws.on('message', handleWebSocketMessage); // Handle incoming messages

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
    ws.close(); // Close to trigger reconnect
  });

  ws.on('close', () => {
    console.warn('⚠️ WebSocket closed. Reconnecting in 5s...');
    setTimeout(startOrderBookService, 5000); // Reconnect after 5 seconds
  });
}

module.exports = startOrderBookService;
