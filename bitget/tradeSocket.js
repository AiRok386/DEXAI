// bitget/tradeSocket.js

const WebSocket = require('ws');
const Trade = require('../models/Trade'); // Your Trade model

const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt']; // Add your tracked symbols here
const WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// Subscribe to trade feed for a specific symbol
function subscribeTrades(ws, symbol) {
  const msg = {
    op: 'subscribe',
    args: [
      {
        instType: 'SPOT',
        channel: 'trade', // Real-time trade feed
        instId: symbol.toUpperCase(),
      },
    ],
  };

  ws.send(JSON.stringify(msg));
  console.log(`📡 Subscribed to trade feed: ${symbol.toUpperCase()}`);
}

// Handle and save trade messages to MongoDB
function handleTradeMessage(msg) {
  const { arg, data } = msg;

  if (!arg || !data || !Array.isArray(data) || data.length === 0) return;

  const symbol = arg.instId.toUpperCase();
  const trade = data[0];

  // Parse trade data
  const tradeData = {
    symbol,
    price: trade.p, // Trade price
    quantity: trade.s, // Trade size
    side: trade.side, // 'buy' or 'sell'
    timestamp: new Date(trade.ts), // Trade timestamp
  };

  // Save trade data to MongoDB
  const newTrade = new Trade(tradeData);

  newTrade.save().catch((err) => {
    console.error(`❌ Failed to save trade for ${symbol}:`, err.message);
  });
}

// Connect to Bitget WebSocket API and listen for trade feed messages
function connectTradeSocket() {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget Trade WebSocket');

    SYMBOLS.forEach((symbol) => {
      subscribeTrades(ws, symbol); // Subscribe for each symbol
    });
  });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'error') {
        console.error('❌ Bitget error:', msg);
      } else if (msg.arg && msg.data) {
        handleTradeMessage(msg);
      }
    } catch (err) {
      console.error('❌ Failed to parse Bitget message:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.warn('🔌 WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectTradeSocket, 5000); // Reconnect if the WebSocket closes
  });
}

module.exports = connectTradeSocket;
