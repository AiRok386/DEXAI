// sockets/trading.socket.js

const WebSocket = require('ws');
const fetchTopTradingPairs = require('../utils/fetchTopPairs');
const { broadcastPriceUpdate, broadcastDepthUpdate } = require('../utils/websocket.util');

const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('🔌 New trader connected:', socket.id);

    // Fetch top 15 trading pairs dynamically
    const tradingPairs = await fetchTopTradingPairs(15);

    if (!tradingPairs || tradingPairs.length === 0) {
      console.error('❌ No trading pairs found. Aborting Bitget WebSocket setup.');
      return;
    }

    // Open Bitget WebSocket connection
    const ws = new WebSocket(BITGET_WS_URL);

    ws.on('open', () => {
      console.log('✅ Connected to Bitget WebSocket');

      const args = tradingPairs.flatMap((symbol) => [
        { instType: 'SPOT', channel: 'trade', instId: symbol },
        { instType: 'SPOT', channel: 'depth5', instId: symbol }
      ]);

      ws.send(JSON.stringify({ op: 'subscribe', args }));
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);

        if (msg.arg?.channel === 'trade') {
          const [trade] = msg.data || [];
          if (trade) {
            const payload = {
              pair: msg.arg.instId,
              price: parseFloat(trade.p),
              qty: parseFloat(trade.sz),
              timestamp: trade.ts,
              side: trade.side,
            };
            io.emit('tradeUpdate', payload);
            broadcastPriceUpdate(io, payload);
          }
        }

        if (msg.arg?.channel === 'depth5' && msg.data) {
          const { bids, asks, ts } = msg.data;
          const depth = {
            pair: msg.arg.instId,
            bids: bids.map(([price, qty]) => [parseFloat(price), parseFloat(qty)]),
            asks: asks.map(([price, qty]) => [parseFloat(price), parseFloat(qty)]),
            timestamp: ts
          };
          socket.emit('depth_update', depth);
          broadcastDepthUpdate(io, depth);
        }

      } catch (err) {
        console.error('❌ Error parsing Bitget WebSocket message:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('🔌 Bitget WebSocket disconnected');
    });

    ws.on('error', (err) => {
      console.error('❌ Bitget WebSocket error:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('❎ Trader disconnected:', socket.id);
      ws.close();
    });
  });
};
