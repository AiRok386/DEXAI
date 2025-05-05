const WebSocket = require('ws');
const Ticker = require('../models/Ticker');

const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

const connectBitgetTickerSocket = () => {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('✅ Connected to Bitget Ticker WebSocket');

    ws.send(JSON.stringify({
      op: 'subscribe',
      args: allowedSymbols.map(symbol => `spot/ticker:${symbol}`)
    }));
  });

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw);
      const { topic, data } = msg;

      if (!topic || !data) return;

      if (topic.startsWith('spot/ticker:')) {
        const symbol = topic.split(':')[1];

        const ticker = new Ticker({
          symbol,
          lastPrice: parseFloat(data.lastPr),
          high24h: parseFloat(data.high24h),
          low24h: parseFloat(data.low24h),
          change24h: parseFloat(data.change24h),
          volume24h: parseFloat(data.baseVolume),
          quoteVolume24h: parseFloat(data.quoteVolume),
          bestBid: parseFloat(data.bestBid),
          bestAsk: parseFloat(data.bestAsk),
        });

        await ticker.save();
        console.log(`💹 Ticker updated for ${symbol}`);
      }
    } catch (err) {
      console.error('❌ Ticker WebSocket error:', err.message);
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ Ticker WebSocket closed. Reconnecting...');
    setTimeout(connectBitgetTickerSocket, 5000);
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget Ticker WS error:', err.message);
  });
};

module.exports = connectBitgetTickerSocket;
