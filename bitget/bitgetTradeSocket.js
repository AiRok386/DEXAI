// /src/bitget/bitgetTradeSocket.js
const WebSocket = require('ws');

function startBitgetTradeSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('Connected to Bitget trade stream');

    ws.send(JSON.stringify({
      op: 'subscribe',
      args: [{ instType: 'SPOT', channel: 'trade', instId: 'BTCUSDT' }]
    }));
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Trade data:', message);
    // Save to DB or broadcast here
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed. Reconnecting...');
    setTimeout(startBitgetTradeSocket, 5000);
  });
}

module.exports = startBitgetTradeSocket;
