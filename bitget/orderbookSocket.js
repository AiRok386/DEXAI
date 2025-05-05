// bitgetOrderBookSocket.js

const WebSocket = require('ws');
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

const WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
const symbols = ['btcusdt', 'ethusdt', 'solusdt']; // Add more tokens here if needed

let socket;

// Helper function to create the subscription payload
function createSubscriptionPayload(tokens, channel = 'depth5') {
  return {
    op: 'subscribe',
    args: tokens.map(symbol => ({
      instType: 'SPOT',
      channel,
      instId: symbol.toUpperCase(),
    })),
  };
}

// Function to handle incoming WebSocket messages
function handleOrderBookMessage(message) {
  try {
    const data = JSON.parse(message);

    // Ensure the data structure is valid and contains the necessary fields
    if (data.arg?.channel === 'depth5' && data.data?.length) {
      const { arg, data: [snapshot] } = data;
      const symbol = arg.instId.toUpperCase();

      const orderBook = {
        symbol,
        bids: snapshot.bids,
        asks: snapshot.asks,
      };

      // Save the order book snapshot to MongoDB
      const newSnapshot = new OrderBookSnapshot(orderBook);
      newSnapshot.save()
        .then(() => console.log(`📥 OrderBook snapshot saved for ${symbol}`))
        .catch(err => console.error(`❌ Error saving snapshot for ${symbol}:`, err.message));
    } else if (data.event === 'subscribe') {
      console.log(`✅ Subscribed to ${data.arg.channel} for ${data.arg.instId}`);
    }
  } catch (err) {
    console.error('❌ Error parsing WebSocket message:', err.message);
  }
}

// Function to connect to the Bitget OrderBook WebSocket
function connectOrderBookSocket(tokens) {
  if (!tokens || tokens.length === 0) {
    console.warn('⚠️ No tokens provided for OrderBook WebSocket');
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.on('open', () => {
    console.log('🔌 Connected to Bitget OrderBook WebSocket');

    // Create the payload for subscribing to the order book depth
    const payload = createSubscriptionPayload(tokens, 'depth5');
    socket.send(JSON.stringify(payload));
  });

  socket.on('message', handleOrderBookMessage);

  socket.on('error', (err) => {
    console.error('❌ Error with OrderBook WebSocket:', err.message);
    socket.close(); // Close socket on error
  });

  socket.on('close', () => {
    console.warn('❌ OrderBook WebSocket connection closed. Reconnecting in 5 seconds...');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => connectOrderBookSocket(tokens), 5000);
  });
}

module.exports = { connectOrderBookSocket };
