const WebSocket = require('ws');
const Ticker = require('../models/Ticker');

const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

const ws = new WebSocket(BITGET_WS_URL);

ws.on('open', () => {
  console.log('✅ Connected to Bitget Ticker WebSocket');
  allowedSymbols.forEach(symbol => {
    ws.send(JSON.stringify({
      op: 'subscribe',
      args: [`spot/ticker:${symbol}`]
    }));
  });
});

ws.on('message', async (message) => {
  try {
    const parsed = JSON.parse(message);
    const { topic, data } = parsed;

    if (topic && topic.startsWith('spot/ticker:')) {
      const symbol = topic.split(':')[1];

      await Ticker.findOneAndUpdate(
        { symbol },
        {
          symbol,
          high24h: parseFloat(data.high24h),
          low24h: parseFloat(data.low24h),
          change24h: parseFloat(data.changeUtc),
          close: parseFloat(data.close),
          quoteVolume: parseFloat(data.quoteVol),
          baseVolume: parseFloat(data.baseVol),
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error('❌ Error handling ticker data:', err.message);
  }
});
