const WebSocket = require('ws');
const Market = require('../models/Market');

const symbols = [
  'btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt',
  'dogeusdt', 'pepeusdt', 'suiusdt', 'adausdt', 'trxusdt',
  'tonusdt', 'ltcusdt', 'avaxusdt', 'shibusdt', 'dotusdt'
];

const bitgetWs = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

bitgetWs.on('open', () => {
  console.log('✅ Bitget WebSocket connected');

  const subs = symbols.map((symbol) => ({
    instType: 'SPOT',
    channel: 'ticker',
    instId: symbol.toUpperCase()
  }));

  bitgetWs.send(JSON.stringify({
    op: 'subscribe',
    args: subs
  }));
});

bitgetWs.on('message', async (raw) => {
  try {
    const data = JSON.parse(raw);

    if (data.action === 'snapshot' || data.action === 'update') {
      const ticker = data.data?.[0];
      if (!ticker || !ticker.instId) return;

      const symbol = ticker.instId;
      const price = parseFloat(ticker.lastPr);

      await Market.findOneAndUpdate(
        { symbol },
        { $set: { price, updatedAt: new Date() } },
        { upsert: true }
      );

      console.log(`📈 Updated ${symbol} = $${price}`);
    }
  } catch (error) {
    console.error('❌ Bitget WS error:', error.message);
  }
});

bitgetWs.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
});

bitgetWs.on('close', () => {
  console.log('🔌 Bitget WebSocket disconnected');
});
