// bitget/bitgetOrderBookSocket.js

const WebSocket = require('ws');
const OrderBook = require('../models/OrderBook');

function connectOrderBookSocket(tokens) {
  tokens.forEach((symbol) => {
    const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

    ws.on('open', () => {
      const subscribeMsg = {
        op: 'subscribe',
        args: [
          {
            instType: 'SPOT',
            channel: 'books',
            instId: symbol,
          },
        ],
      };
      ws.send(JSON.stringify(subscribeMsg));
      console.log(`📡 Subscribed to Order Book: ${symbol}`);
    });

    ws.on('message', async (data) => {
      try {
        const json = JSON.parse(data);
        const content = json.data?.[0];
        if (content) {
          const { asks, bids, ts } = content;
          await OrderBook.findOneAndUpdate(
            { symbol },
            { symbol, asks, bids, timestamp: ts },
            { upsert: true }
          );
        }
      } catch (error) {
        console.error(`❌ Order Book error [${symbol}]:`, error.message);
      }
    });

    ws.on('error', (err) => {
      console.error(`❌ WebSocket Error for ${symbol}:`, err.message);
    });

    ws.on('close', () => {
      console.log(`⚠️ WebSocket closed for ${symbol}. Attempting reconnect in 5s.`);
      setTimeout(() => connectOrderBookSocket([symbol]), 5000);
    });
  });
}

module.exports = { connectOrderBookSocket };
