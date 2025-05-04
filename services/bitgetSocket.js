// services/bitgetSocket.js

const WebSocket = require('ws');

// Define the trading pairs you want to subscribe to (use lowercase and hyphen format)
const tradingPairs = ['btcusdt', 'ethusdt', 'solusdt']; // Add more as needed

// Create WebSocket connection to Bitget public market data
const ws = new WebSocket('wss://ws.bitget.com/mix/v1/stream');

ws.on('open', () => {
  console.log('✅ Connected to Bitget WebSocket');

  // Subscribe to tickers for each pair
  const subscriptions = tradingPairs.map(symbol => ({
    op: 'subscribe',
    args: [{
      instType: 'SPOT',
      channel: 'ticker',
      instId: symbol.toUpperCase()
    }]
  }));

  subscriptions.forEach(sub => ws.send(JSON.stringify(sub)));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  if (message.arg && message.data) {
    const symbol = message.arg.instId;
    const price = message.data.last;
    
    console.log(`📈 ${symbol} price: ${price}`);

    // TODO: You can now update MongoDB or broadcast to frontend
  }
});

ws.on('error', (err) => {
  console.error('❌ Bitget WebSocket error:', err.message);
});

ws.on('close', () => {
  console.warn('🔌 Bitget WebSocket closed. Trying to reconnect...');
  setTimeout(() => require('./bitgetSocket'), 3000); // Reconnect
});
