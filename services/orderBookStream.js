const WebSocket = require('ws');
const io = require('../server'); // Emit to frontend

// Bitget WebSocket URL
const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// Function to connect to Bitget WebSocket and listen to Order Book updates
const connectOrderBookStream = () => {
  const ws = new WebSocket(BITGET_WS_URL);

  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket for Order Book');

    // Subscribe to the Order Book for BTC-USDT (can dynamically change this as needed)
    ws.send(JSON.stringify({
      op: 'subscribe',
      args: [{
        channel: 'spot/orderBook',
        instId: 'BTC-USDT',
      }],
    }));
  });

  ws.on('message', (data) => {
    const parsedData = JSON.parse(data);

    // Check if the message is from the orderBook channel
    if (parsedData.arg?.channel === 'spot/orderBook') {
      const { asks, bids, lastUpdateId } = parsedData.data;

      // Emit order book data to the frontend (using Socket.IO)
      io.emit('orderBookUpdate', {
        bids,
        asks,
        lastUpdateId,
      });

      // Optionally log the data for debugging
      console.log('Order Book Update:', { bids, asks, lastUpdateId });
    }
  });

  ws.on('close', () => {
    console.log('❌ Disconnected from Bitget WebSocket');
  });

  ws.on('error', (err) => {
    console.error('WebSocket Error:', err);
  });
};

// Export the function to be used in the main server
module.exports = connectOrderBookStream;
