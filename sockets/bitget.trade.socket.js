const WebSocket = require('ws');
const Trade = require('../models/Trade');

const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

const connectBitgetTradeSocket = () => {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('✅ Connected to Bitget Trade WebSocket');

    ws.send(JSON.stringify({
      op: 'subscribe',
      args: allowedSymbols.map(symbol => `spot/trade:${symbol}`)
    }));
  });

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw);
      const { topic, data } = msg;

      if (!topic || !data || !Array.isArray(data)) return;

      if (topic.startsWith('spot/trade:')) {
        const symbol = topic.split(':')[1];

        for (const trade of data) {
          const newTrade = new Trade({
            symbol,
            price: parseFloat(trade.p),
            size: parseFloat(trade.v),
            side: trade.S.toLowerCase(), // 'buy' or 'sell'
            timestamp: new Date(Number(trade.T))
          });

          await newTrade.save();
          console.log(`💥 Trade saved for ${symbol}`);
        }
      }
    } catch (err) {
      console.error('❌ Trade WebSocket error:', err.message);
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ Trade WebSocket closed. Reconnecting...');
    setTimeout(connectBitgetTradeSocket, 5000);
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget Trade WS error:', err.message);
  });
};

module.exports = connectBitgetTradeSocket;
