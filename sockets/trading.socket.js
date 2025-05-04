// sockets/trading.socket.js

const WebSocket = require('ws');
const { broadcastPriceUpdate, broadcastDepthUpdate } = require('../utils/websocket.util');

// Bitget WebSocket Endpoint
const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// Tokens you want to stream (top tokens can be dynamically added later)
const tradingPairs = ['BTCUSDT', 'ETHUSDT']; // Add more if needed

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New trader connected:', socket.id);

    // Setup Bitget WebSocket connection
    const ws = new WebSocket(BITGET_WS_URL);

    ws.on('open', () => {
      console.log('✅ Connected to Bitget WebSocket');

      const args = [];

      tradingPairs.forEach((symbol) => {
        args.push({ instType: 'SPOT', channel: 'trade', instId: symbol });
        args.push({ instType: 'SPOT', channel: 'depth5', instId: symbol });
      });

      ws.send(JSON.stringify({
        op: 'subscribe',
        args
      }));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);

        if (msg.arg?.channel === 'trade') {
          const [trade] = msg.data || [];
          if (trade) {
            const payload = {
              pair: msg.arg.instId,
              price: parseFloat(trade.p),
              qty: parseFloat(trade.sz),
              timestamp: trade.ts,
              side: trade.side, // 'buy' or 'sell'
            };
            io.emit('tradeUpdate', payload);
            broadcastPriceUpdate(io, payload);
          }
        }

        if (msg.arg?.channel === 'depth5') {
          const { bids, asks, ts } = msg.data || {};
          if (bids && asks) {
            const depth = {
              pair: msg.arg.instId,
              bids: bids.map(([price, qty]) => [parseFloat(price), parseFloat(qty)]),
              asks: asks.map(([price, qty]) => [parseFloat(price), parseFloat(qty)]),
              timestamp: ts
            };
            socket.emit('depth_update', depth);
            broadcastDepthUpdate(io, depth);
          }
        }
      } catch (err) {
        console.error('❌ Failed to process Bitget WebSocket message:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('❌ Bitget WebSocket closed');
    });

    ws.on('error', (error) => {
      console.error('❌ Bitget WebSocket error:', error);
    });

    socket.on('disconnect', () => {
      console.log('❎ Trader disconnected:', socket.id);
      ws.close();
    });
  });
};
