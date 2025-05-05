const WebSocket = require('ws');
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

const WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
const symbols = ['btcusdt', 'ethusdt', 'solusdt']; // List of symbols to track

let socket;

function createSubscriptionPayload(tokens, channel = 'depth5') {
  // Create the payload for subscribing to order book data
  return {
    op: 'subscribe',
    args: tokens.map(symbol => ({
      instType: 'SPOT',
      channel,
      instId: symbol.toUpperCase(),
    })),
  };
}

function handleOrderBookMessage(message) {
  try {
    // Parse incoming message
    const data = JSON.parse(message);
    if (data.arg?.channel === 'depth5' && data.data?.length) {
      // Extract relevant order book snapshot data
      const { arg, data: [snapshot] } = data;
      const symbol = arg.instId.toUpperCase();

      const orderBook = {
        symbol,
        bids: snapshot.bids,
        asks: snapshot.asks,
      };

      // Save snapshot to MongoDB
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

function connectOrderBookSocket(tokens) {
  if (!tokens || tokens.length === 0) {
    console.warn('⚠️ No tokens provided for OrderBook WebSocket');
    return;
  }

  // Initialize WebSocket connection
  socket = new WebSocket(WS_URL);

  socket.on('open', () => {
    console.log('🔌 Connected to Bitget OrderBook WebSocket');

    // Create and send subscription payload to Bitget WebSocket
    const payload = createSubscriptionPayload(tokens, 'depth5');
    socket.send(JSON.stringify(payload));
  });

  socket.on('message', handleOrderBookMessage);

  socket.on('error', (err) => {
    console.error('❌ Error with OrderBook WebSocket:', err.message);
    socket.close(); // Close the connection on error
  });

  socket.on('close', () => {
    console.warn('❌ OrderBook WebSocket connection closed. Reconnecting in 5 seconds...');
    // Reconnect after 5 seconds
    setTimeout(() => connectOrderBookSocket(tokens), 5000);
  });
}

module.exports = { connectOrderBookSocket };
