const WebSocket = require('ws');
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

const symbols = ['btcusdt', 'ethusdt']; // Add more symbols as needed

function subscribeOrderBook(ws, symbol) {
  const payload = {
    op: 'subscribe',
    args: [
      {
        instType: 'SPOT',
        channel: 'depth5', // 5-level depth
        instId: symbol.toUpperCase(),
      },
    ],
  };

  ws.send(JSON.stringify(payload));
}

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

function connectBitgetOrderBookSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget Order Book WebSocket');
    symbols.forEach(symbol => subscribeOrderBook(ws, symbol));
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
    setTimeout(connectBitgetOrderBookSocket, 5000);
  });
}

module.exports = connectBitgetOrderBookSocket;
