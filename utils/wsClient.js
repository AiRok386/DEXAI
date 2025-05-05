// utils/wsClient.js
const WebSocket = require('ws');

function createBitgetWebSocket() {
  const socket = new WebSocket('wss://ws.bitget.com/spot/v1/stream');
  return socket;
}

module.exports = { createBitgetWebSocket };
