const WebSocket = require('ws');
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

const WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
const symbols = ['btcusdt', 'ethusdt', 'solusdt']; // Add more tracked symbols here

let socket;

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

function handleOrderBookMessage(message) {
  try {
    const data = JSON.parse(message);
    if (data.arg?.channel === 'depth5' && data.data?.length) {
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
    } else if (data.event === 'subscribe') {
      console.log(`✅ Subscribed to ${data.arg.channel} for ${data.arg.instId}`);
    }
  } catch (err) {
    console.error('❌ Message parse error:', err.message);
  }
}

function connectOrderBookSocket(tokens) {
  if (!tokens || tokens.length === 0) {
    console.warn('⚠️ No tokens provided to OrderBook WebSocket');
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.on('open', () => {
    console.log('🔌 Connected to Bitget Order Book WebSocket');
    const payload = createSubscriptionPayload(tokens, 'depth5');
    socket.send(JSON.stringify(payload));
  });

  socket.on('message', handleOrderBookMessage);

  socket.on('error', (err) => {
    console.error('❌ OrderBook WebSocket error:', err.message);
  });

  socket.on('close', () => {
    console.warn('❌ OrderBook WebSocket closed. Reconnecting in 5s...');
    setTimeout(() => connectOrderBookSocket(tokens), 5000);
  });
}

module.exports = { connectOrderBookSocket };
