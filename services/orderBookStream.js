const WebSocket = require('ws');
const io = require('../server'); // emit to frontend

const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth');

ws.on('message', (data) => {
  const depth = JSON.parse(data);

  // Send to frontend
  io.emit('orderBookUpdate', {
    bids: depth.bids,
    asks: depth.asks,
    lastUpdateId: depth.u,
  });
});
