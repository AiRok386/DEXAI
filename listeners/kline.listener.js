// listeners/kline.listener.js

const WebSocket = require('ws');
const Kline = require('../models/Kline');
const { parseKlineMessage } = require('../utils/parseHelpers');

// Bitget WebSocket endpoint for spot klines
const wsUrl = 'wss://ws.bitget.com/spot/v1/stream';

// Symbols and intervals to subscribe to
const symbols = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT'];
const intervals = ['1m', '5m', '15m'];

function getTopic(symbol, interval) {
  // Bitget format: candles(symbol,interval)
  return `candle1m.${symbol}`.replace('1m', interval);
}

function subscribePayload() {
  return symbols.flatMap((symbol) =>
    intervals.map((interval) => ({
      op: 'subscribe',
      args: [getTopic(symbol, interval)],
    }))
  );
}

function startKlineListener() {
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    console.log('✅ WebSocket connected for klines');
    subscribePayload().forEach((msg) => {
      ws.send(JSON.stringify(msg));
    });
  });

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed || !parsed.data || !parsed.arg?.instId) return;

      const klineData = parseKlineMessage(parsed);
      if (!klineData) return;

      const { symbol, interval, openTime } = klineData;

      await Kline.findOneAndUpdate(
        { symbol, interval, openTime },
        { $set: klineData },
        { upsert: true }
      );
    } catch (error) {
      console.error('❌ Error processing kline WebSocket message:', error.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error (kline):', err.message);
  });

  ws.on('close', () => {
    console.warn('⚠️ WebSocket closed (kline). Reconnecting in 5s...');
    setTimeout(startKlineListener, 5000);
  });
}

module.exports = startKlineListener;
