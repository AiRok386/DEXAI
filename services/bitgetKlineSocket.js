const WebSocket = require('ws');
const Kline = require('../models/Kline');

const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

const ws = new WebSocket(BITGET_WS_URL);

const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

ws.on('open', () => {
  console.log('✅ Connected to Bitget Kline WebSocket');
  allowedSymbols.forEach(symbol => {
    ws.send(JSON.stringify({
      op: 'subscribe',
      args: [`spot/candle60s:${symbol}`] // 1-minute candlesticks
    }));
  });
});

ws.on('message', async (message) => {
  try {
    const parsed = JSON.parse(message);
    const { topic, data } = parsed;
    if (topic && topic.startsWith('spot/candle60s:')) {
      const symbol = topic.split(':')[1];
      const [timestamp, o, h, l, c, v, qv] = data;

      await Kline.create({
        symbol,
        interval: '1m',
        open: parseFloat(o),
        high: parseFloat(h),
        low: parseFloat(l),
        close: parseFloat(c),
        volume: parseFloat(v),
        quoteVolume: parseFloat(qv),
        timestamp: new Date(Number(timestamp))
      });
    }
  } catch (err) {
    console.error('❌ Error handling kline message:', err.message);
  }
});
