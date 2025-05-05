const WebSocket = require('ws');
const Kline = require('../models/Kline');

// List of allowed trading pairs
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

const connectBitgetKlineSocket = () => {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('✅ Connected to Bitget Kline WebSocket');

    allowedSymbols.forEach(symbol => {
      ws.send(JSON.stringify({
        op: 'subscribe',
        args: [`spot/candle5m:${symbol}`], // 5-minute candlesticks
      }));
    });
  });

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw);
      const { topic, data } = msg;

      if (!topic || !data) return;

      if (topic.startsWith('spot/candle5m:')) {
        const symbol = topic.split(':')[1];
        const [
          timestamp, open, high, low, close, volume, turnover
        ] = data;

        const kline = new Kline({
          symbol,
          interval: '5m',
          openTime: new Date(Number(timestamp)),
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
          volume: parseFloat(volume),
          turnover: parseFloat(turnover),
        });

        await kline.save();
        console.log(`📈 Kline saved for ${symbol}`);
      }
    } catch (err) {
      console.error('❌ Kline WebSocket error:', err.message);
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ Bitget Kline WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectBitgetKlineSocket, 5000);  // Attempt to reconnect after 5 seconds
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget Kline WebSocket error:', err.message);
  });
};

module.exports = connectBitgetKlineSocket;
