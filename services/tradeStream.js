const WebSocket = require('ws');
const io = require('../server'); // emit to frontend

const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

ws.on('message', (data) => {
  const trade = JSON.parse(data);

  io.emit('tradeUpdate', {
    price: trade.p,
    qty: trade.q,
    timestamp: trade.T,
    isBuyerMaker: trade.m,
  });
});
