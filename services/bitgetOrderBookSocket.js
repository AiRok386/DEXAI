// services/bitgetOrderBookSocket.js

const WebSocket = require('ws');
const OrderBook = require('../models/OrderBook');

function connectBitgetOrderBookSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('✅ Connected to Bitget Order Book WebSocket');

    const pairs = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
      'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
      'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
    ];

    pairs.forEach(symbol => {
      const instId = symbol.replace('USDT', '/USDT');

      ws.send(JSON.stringify({
        op: 'subscribe',
        args: [{ instType: 'SPOT', channel: 'books', instId }]
      }));
    });
  });

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.data || !parsed.arg?.instId) return;

      const { bids, asks, ts } = parsed.data;
      const symbol = parsed.arg.instId.replace('/', '');

      await OrderBook.findOneAndUpdate(
        { symbol },
        { symbol, bids, asks, timestamp: ts },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('❌ Error saving Bitget order book data:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.log('🔌 Bitget WebSocket disconnected. Reconnecting in 3s...');
    setTimeout(connectBitgetOrderBookSocket, 3000);
  });
}

module.exports = connectBitgetOrderBookSocket;
