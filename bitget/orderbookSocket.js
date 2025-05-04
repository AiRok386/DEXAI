// bitget/orderBookSocket.js

const WebSocket = require('ws');
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

const symbols = ['btcusdt', 'ethusdt', 'solusdt']; // Add your tracked symbols here
const WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// Subscribe to order book depth data for a specific symbol
function subscribeOrderBook(ws, symbol) {
  const msg = {
    op: 'subscribe',
    args: [
      {
        instType: 'SPOT',
        channel: 'depth5', // 5-level depth (bids/asks)
        instId: symbol.toUpperCase(), // Symbol in uppercase
      },
    ],
  };

  ws.send(JSON.stringify(msg));
  console.log(`📡 Subscribed to order book: ${symbol.toUpperCase()}`);
}

// Handle and save order book snapshot to MongoDB
function handleOrderBookSnapshot(data) {
  const { arg, data: [snapshot] } = data;
  const symbol = arg.instId.toUpperCase();

  const orderBook = {
    symbol,
    bids: snapshot.bids,
    asks: snapshot.asks,
  };

  const newSnapshot = new OrderBookSnapshot(orderBook);
  newSnapshot.save()
    .then(() => console.log(`📥 OrderBook snapshot saved for ${symbol}`))
    .catch(err => console.error(`❌ Error saving snapshot for ${symbol}:`, err.message));
}

// Connect to Bitget WebSocket API and listen for messages
function connectBitgetOrderBookSocket() {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget Order Book WebSocket');
    symbols.forEach(symbol => subscribeOrderBook(ws, symbol)); // Subscribe for each symbol
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.event === 'subscribe') {
        console.log('✅ Subscribed:', data.arg.channel, data.arg.instId);
      } else if (data.arg?.channel === 'depth5' && data.data) {
        handleOrderBookSnapshot(data);
      }
    } catch (err) {
      console.error('❌ WebSocket message parse error:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.log('❌ WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectBitgetOrderBookSocket, 5000); // Reconnect if the WebSocket closes
  });
}

module.exports = connectBitgetOrderBookSocket;
