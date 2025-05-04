// services/bitgetTradeSocket.js

const WebSocket = require('ws');
const Trade = require('../models/Trade');

function connectBitgetTradeSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('✅ Connected to Bitget Trade WebSocket');

    const pairs = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
      'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
      'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
    ];

    pairs.forEach(symbol => {
      const instId = symbol.replace('USDT', '/USDT');
      ws.send(JSON.stringify({
        op: 'subscribe',
        args: [{ instType: 'SPOT', channel: 'trade', instId }]
      }));
    });
  });

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.data || !parsed.arg?.instId) return;

      const trades = parsed.data;
      const symbol = parsed.arg.instId.replace('/', '');

      for (const trade of trades) {
        await Trade.create({
          symbol,
          price: trade.px,
          size: trade.sz,
          side: trade.side,
          timestamp: trade.ts
        });
      }
    } catch (err) {
      console.error('❌ Error saving Bitget trade data:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget Trade WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.log('🔌 Bitget Trade WebSocket disconnected. Reconnecting in 3s...');
    setTimeout(connectBitgetTradeSocket, 3000);
  });
}

module.exports = connectBitgetTradeSocket;
