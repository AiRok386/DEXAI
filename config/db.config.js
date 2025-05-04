const mongoose = require('mongoose');
require('dotenv').config();

// Function to connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log success message if connected
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    // Log error message if connection fails
    console.error('❌ DB Connection Error:', err.message);

    // Exit the process in case of connection failure
    process.exit(1);
  }
};

// Function to initialize the Bitget WebSocket connection
const initializeBitgetWebSocket = () => {
  const WebSocket = require('ws');
  
  // Bitget WebSocket URL (replace with actual URL for Bitget)
  const wsUrl = 'wss://api.bitget.com/ws/v1/';

  const ws = new WebSocket(wsUrl);

  // WebSocket open event
  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket');
    // Subscribe to the relevant channels for market data (e.g., ticker, order book)
    const subscribeMessage = JSON.stringify({
      "op": "subscribe",
      "args": ["spot/ticker:BTC-USDT", "spot/orderbook:BTC-USDT"]
    });
    ws.send(subscribeMessage);
  });

  // WebSocket message event - handle incoming data from Bitget
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Received data:', message);

    // Handle incoming market data, process and store it into MongoDB
    // Here you would update your models (e.g., OrderBook, Trade) with the new data
  });

  // WebSocket error event
  ws.on('error', (error) => {
    console.error('❌ Bitget WebSocket Error:', error);
  });

  // WebSocket close event
  ws.on('close', () => {
    console.log('❌ Bitget WebSocket closed. Reconnecting...');
    setTimeout(initializeBitgetWebSocket, 5000); // Reconnect after 5 seconds
  });
};

// Export the functions for use in other parts of the app
module.exports = { connectDB, initializeBitgetWebSocket };
