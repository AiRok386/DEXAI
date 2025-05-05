const WebSocket = require('ws');
const OrderBook = require('../models/OrderBook');

const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

const connectBitgetOrderBookSocket = () => {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket for Order Books');

    allowedSymbols.forEach(symbol => {
      ws.send(JSON.stringify({
        op: 'subscribe',
        args: [`spot/orderbook:${symbol}`]
      }));
    });
  });

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw);
      const { topic, data } = msg;

      if (!topic || !data) return;

      if (topic.startsWith('spot/orderbook:')) {
        const symbol = topic.split(':')[1];

        const orderBook = new OrderBook({
          symbol,
          bids: data.bids || [],
          asks: data.asks || [],
          lastUpdateId: data.lastUpdateId || null,
          timestamp: new Date()
        });

        await orderBook.save();
        console.log(`📘 OrderBook updated for ${symbol}`);
      }
    } catch (err) {
      console.error('❌ Order Book WebSocket error:', err.message);
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ Order Book WebSocket closed. Reconnecting...');
    setTimeout(connectBitgetOrderBookSocket, 5000);
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget OrderBook WS error:', err.message);
  });
};

module.exports = connectBitgetOrderBookSocket;
