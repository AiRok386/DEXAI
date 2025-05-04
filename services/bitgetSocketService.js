const WebSocket = require('ws');

const subscribedSymbols = [
  'btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt',
  'dogeusdt', 'pepeusdt', 'suiusdt', 'adausdt', 'trxusdt',
  'tonusdt', 'ltcusdt', 'avaxusdt', 'shibusdt', 'dotusdt'
];

const bitgetWSUrl = 'wss://ws.bitget.com/mix/v1/stream';

let ws;

function connectToBitget() {
  ws = new WebSocket(bitgetWSUrl);

  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket');

    const subscriptions = subscribedSymbols.map(symbol => ({
      op: 'subscribe',
      args: [
        `ticker:cmt_${symbol}_usdt`,
        `depth5:cmt_${symbol}_usdt`, // top 5 orderbook
        `trade:cmt_${symbol}_usdt`
      ]
    }));

    subscriptions.forEach(sub => {
      ws.send(JSON.stringify(sub));
    });
  });

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed?.action === 'snapshot' || parsed?.action === 'update') {
        // TODO: save or broadcast data to frontend here
        console.log('📥 Live Bitget Data:', parsed);
      }
    } catch (err) {
      console.error('❌ Failed to parse Bitget WS message:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket Error:', err.message);
  });

  ws.on('close', () => {
    console.log('🔌 Bitget WebSocket closed. Reconnecting...');
    setTimeout(connectToBitget, 3000);
  });
}

module.exports = connectToBitget;
