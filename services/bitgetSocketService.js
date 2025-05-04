// services/bitgetSocketService.js
// ✅ This service connects to Bitget WebSocket and handles live data (price, trades, orderbook, candles)

const WebSocket = require('ws');
const Market = require('../models/Market');

// Symbol you want to mirror from Bitget (e.g., BTCUSDT)
const symbol = 'btcusdt'; // lowercase required for Bitget

// WebSocket endpoint for Bitget's unified market stream
const WS_URL = `wss://ws.bitget.com/mix/v1/stream`; // Spot/Mix market

function connectToBitget() {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget WebSocket');

    // Subscribe to price ticker
    const subscribeTicker = {
      op: 'subscribe',
      args: [{ instType: 'SPOT', channel: 'ticker', instId: symbol.toUpperCase() }],
    };

    // Subscribe to trades
    const subscribeTrades = {
      op: 'subscribe',
      args: [{ instType: 'SPOT', channel: 'trade', instId: symbol.toUpperCase() }],
    };

    // Subscribe to order book
    const subscribeOrderBook = {
      op: 'subscribe',
      args: [{ instType: 'SPOT', channel: 'depth5', instId: symbol.toUpperCase() }],
    };

    // Subscribe to candlesticks (1m interval)
    const subscribeCandles = {
      op: 'subscribe',
      args: [{ instType: 'SPOT', channel: 'candle1m', instId: symbol.toUpperCase() }],
    };

    // Send all subscriptions
    ws.send(JSON.stringify(subscribeTicker));
    ws.send(JSON.stringify(subscribeTrades));
    ws.send(JSON.stringify(subscribeOrderBook));
    ws.send(JSON.stringify(subscribeCandles));
  });

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data);
      const channel = parsed.arg?.channel;
      const instId = parsed.arg?.instId;

      if (!channel || !instId) return;

      // Prepare update object
      let update = {};

      // Handle ticker updates (real-time price + 24h info)
      if (channel === 'ticker') {
        const t = parsed.data?.[0];
        if (t) {
          update.price = parseFloat(t.last);
          update.volume24h = parseFloat(t.baseVolume);
          update.change24h = parseFloat(t.changeUtc24h);
        }
      }

      // Handle trade feed
      else if (channel === 'trade') {
        const trades = parsed.data;
        if (trades?.length) {
          const lastTrade = trades[0];
          update.lastTrade = {
            price: parseFloat(lastTrade.px),
            size: parseFloat(lastTrade.sz),
            side: lastTrade.side
          };
        }
      }

      // Handle order book updates
      else if (channel === 'depth5') {
        const book = parsed.data?.[0];
        if (book) {
          update.orderBook = {
            bids: book.bids,
            asks: book.asks
          };
        }
      }

      // Handle candlestick updates (1m candle)
      else if (channel === 'candle1m') {
        const c = parsed.data?.[0];
        if (c) {
          update.candle = {
            timestamp: parseInt(c[0]),
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4]),
            volume: parseFloat(c[5])
          };
        }
      }

      // Update the Market model in MongoDB
      await Market.findOneAndUpdate(
        { symbol: instId.toLowerCase() },
        { $set: update },
        { upsert: true, new: true }
      );

    } catch (err) {
      console.error('❌ WebSocket message error:', err.message);
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ Bitget WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectToBitget, 5000);
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget WebSocket error:', err.message);
  });
}

module.exports = connectToBitget;
