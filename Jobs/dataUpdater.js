// Jobs/dataUpdater.js

const WebSocket = require('ws');
const Market = require('../models/Market'); // MongoDB model
const { topPairs } = require('../config/constants'); // Top 15 tokens
const { updateMarketData } = require('../controllers/marketController'); // Helper function to update MongoDB

// In-memory market store (key: symbol, value: market data)
const marketCache = {};

// Bitget WebSocket URL
const bitgetWSUrl = 'wss://ws.bitget.com/spot/v1/stream';

// Function to handle WebSocket connection and data updates
function connectWebSocket() {
  const ws = new WebSocket(bitgetWSUrl);

  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket');
    
    // Subscribe to the top 15 tokens' real-time data for ticker, depth, and kline (candlestick)
    topPairs.forEach(symbol => {
      const subscribeMessage = JSON.stringify({
        "op": "subscribe",
        "args": [
          { "channel": `market.${symbol}.ticker` },
          { "channel": `market.${symbol}.depth` },
          { "channel": `market.${symbol}.kline` }
        ]
      });
      ws.send(subscribeMessage);
    });
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    // Check if the message is a notification from Bitget
    if (message.op === 'notify') {
      const { channel, data: marketData } = message;

      // Process data based on channel type (ticker, depth, kline)
      if (channel.includes('ticker')) {
        updateMarketData('Ticker', marketData);
      } else if (channel.includes('depth')) {
        updateMarketData('OrderBook', marketData);
      } else if (channel.includes('kline')) {
        updateMarketData('Kline', marketData);
      }
    }
  });

  ws.on('close', () => {
    console.log('❌ WebSocket connection closed. Reconnecting...');
    setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err);
  });
}

// Update market data in MongoDB and in-memory store
async function updateMarketData(type, data) {
  const { symbol } = data;
  const formattedData = { symbol, timestamp: new Date() };

  // Handle different data types (ticker, order book, kline)
  if (type === 'Ticker') {
    formattedData.price = parseFloat(data.last);
    formattedData.volume = parseFloat(data.volume);
    formattedData.priceChangePercent = parseFloat(data.priceChangePercent);

    // Update in-memory cache
    marketCache[symbol] = formattedData;

    // Save to MongoDB
    await Market.findOneAndUpdate({ symbol }, { $set: formattedData }, { upsert: true });
  }

  if (type === 'OrderBook') {
    formattedData.bids = data.bids.map(bid => ({ price: bid[0], quantity: bid[1] }));
    formattedData.asks = data.asks.map(ask => ({ price: ask[0], quantity: ask[1] }));

    // Update in-memory cache
    marketCache[symbol] = formattedData;

    // Save to MongoDB
    await Market.findOneAndUpdate({ symbol }, { $set: formattedData }, { upsert: true });
  }

  if (type === 'Kline') {
    formattedData.open = parseFloat(data.open);
    formattedData.close = parseFloat(data.close);
    formattedData.high = parseFloat(data.high);
    formattedData.low = parseFloat(data.low);
    formattedData.volume = parseFloat(data.volume);

    // Update in-memory cache
    marketCache[symbol] = formattedData;

    // Save to MongoDB
    await Market.findOneAndUpdate({ symbol }, { $set: formattedData }, { upsert: true });
  }
}

// Start WebSocket connection and data updater
function startUpdater() {
  connectWebSocket(); // Initiate WebSocket connection
  console.log('🔄 Data updater started...');
}

module.exports = {
  startUpdater,
  getMarketCache: () => marketCache,
};
const { updateMarket } = require('../cache/marketCache');

// When receiving live price from Bitget WS:
updateMarket('BTCUSDT', { price: ' , volume: '...etc' });
