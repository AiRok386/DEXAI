// services/bitgetWebSocket.js

const WebSocket = require('ws');

const wsUrl = 'wss://ws.bitget.com/v2/ws/public';
const tradingPairs = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

let priceCache = {};

function connectWebSocket() {
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    console.log('Connected to Bitget WebSocket');

    const subscribeMsg = {
      op: 'subscribe',
      args: tradingPairs.map(pair => ({
        instType: 'SPOT',
        channel: 'ticker',
        instId: pair
      }))
    };

    ws.send(JSON.stringify(subscribeMsg));

    // Heartbeat to keep the connection alive
    setInterval(() => {
      ws.send('ping');
    }, 30000);
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.action === 'snapshot' && message.data && message.data.length > 0) {
        const tickerData = message.data[0];
        priceCache[tickerData.instId] = parseFloat(tickerData.lastPr);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed. Reconnecting...');
    setTimeout(connectWebSocket, 5000);
  });
}

function getPrice(pair) {
  return priceCache[pair] || null;
}

module.exports = {
  connectWebSocket,
  getPrice
};
