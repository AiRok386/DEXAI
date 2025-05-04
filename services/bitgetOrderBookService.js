// services/bitgetOrderBookService.js

const WebSocket = require('ws');
const Market = require('../models/Market'); // MongoDB model

const BITGET_WS_URL = 'wss://ws.bitget.com/mix/v1/stream';
const SYMBOL = 'btcusdt'; // Change this if needed

function connectOrderBookSocket() {
  const ws = new WebSocket(BITGET_WS_URL);

  ws.on('open', () => {
    console.log('🔌 Bitget Order Book WebSocket connected');

    const subscribeMessage = {
      op: 'subscribe',
      args: [
        {
          instType: 'SPOT',
          channel: 'books',
          instId: SYMBOL.toUpperCase()
        }
      ]
    };

    ws.send(JSON.stringify(subscribeMessage));
  });

  ws.on('message', async (data) => {
    const parsed = JSON.parse(data);
    const orderBook = parsed.data;

    if (orderBook && orderBook.bids && orderBook.asks) {
      try {
        await Market.findOneAndUpdate(
          { symbol: SYMBOL.toUpperCase() },
          {
            orderBook: {
              bids: orderBook.bids.slice(0, 10), // top 10 levels
              asks: orderBook.asks.slice(0, 10)
            }
          },
          { upsert: true }
        );
        console.log('✅ Order book updated in DB');
      } catch (err) {
        console.error('❌ Failed to update order book in DB:', err.message);
      }
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ Bitget Order Book WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectOrderBookSocket, 5000);
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
    ws.close();
  });
}

module.exports = connectOrderBookSocket;
