// services/bitgetKlineListener.js

const WebSocket = require('ws');
const Kline = require('../models/Kline');

const symbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

// Convert to Bitget format, e.g., BTCUSDT → cbt_t:BTCUSDT
const channels = symbols.map(symbol => ({
  instId: symbol,
  channel: 'candle1m'  // 1-minute candles
}));

function connectKlineWebSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('✅ Bitget Kline WebSocket connected');

    ws.send(JSON.stringify({
      op: 'subscribe',
      args: channels
    }));
  });

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.data || !Array.isArray(parsed.data)) return;

      const [k] = parsed.data;
      const symbol = parsed.arg.instId;
      const interval = parsed.arg.channel.replace('candle', ''); // e.g., '1m'

      const newKline = {
        symbol,
        interval,
        startTime: Number(k[0]),
        endTime: Number(k[1]),
        open: k[2],
        high: k[3],
        low: k[4],
        close: k[5],
        volume: k[6]
      };

      await Kline.findOneAndUpdate(
        { symbol, interval, startTime: newKline.startTime },
        newKline,
        { upsert: true }
      );

    } catch (err) {
      console.error('❌ Error parsing/storing kline data:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ Kline WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.warn('⚠️ Kline WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectKlineWebSocket, 5000);
  });
}

module.exports = connectKlineWebSocket;
