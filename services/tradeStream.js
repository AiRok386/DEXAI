const WebSocket = require('ws');
let io; // Socket.IO instance will be assigned in init()

// Bitget WebSocket URL
const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// Function to connect to Bitget WebSocket and listen to trade updates
const connectTradeStream = () => {
  const ws = new WebSocket(BITGET_WS_URL);

  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket for Trades');

    // Subscribe to the trade channel for BTC-USDT (can change this as needed)
    ws.send(JSON.stringify({
      op: 'subscribe',
      args: [{
        channel: 'spot/trade',
        instId: 'BTC-USDT',
      }],
    }));
  });

  ws.on('message', (data) => {
    const parsedData = JSON.parse(data);

    // Check if the message is from the trade channel
    if (parsedData.arg?.channel === 'spot/trade') {
      const trade = parsedData.data[0]; // Get the first trade object

      if (!trade) return;

      const price = parseFloat(trade.price).toFixed(2);
      const qty = parseFloat(trade.size).toFixed(5);
      const timestamp = Date.now();
      const isBuyerMaker = trade.side === 'buy'; // In Bitget, 'buy' side means buyer is the maker

      // Emit trade data to the frontend via Socket.IO
      io.emit('tradeUpdate', {
        price,
        qty,
        timestamp,
        isBuyerMaker,
      });

      console.log(`📡 Emitted trade: $${price} | Qty: ${qty} | Buyer Maker: ${isBuyerMaker}`);
    }
  });

  ws.on('close', () => {
    console.log('❌ Disconnected from Bitget WebSocket');
  });

  ws.on('error', (err) => {
    console.error('WebSocket Error:', err);
  });
};

// Initialize the trade stream with Socket.IO instance
const initTradeStream = (socketIOInstance) => {
  io = socketIOInstance;
  connectTradeStream(); // Start the WebSocket connection and listen for trade updates
};

module.exports = initTradeStream;
