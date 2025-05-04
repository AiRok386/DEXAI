// backend/bitgetSocket.js
const WebSocket = require('ws');
const Market = require('./models/Market');

// Create Bitget WebSocket connection
const socket = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

// Top 15 trading pairs
const pairs = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

socket.on('open', () => {
  console.log('🔌 Connected to Bitget WebSocket');

  pairs.forEach((pair) => {
    const payload = {
      op: 'subscribe',
      args: [
        {
          instType: 'SPOT',
          channel: 'ticker',
          instId: pair
        }
      ]
    };
    socket.send(JSON.stringify(payload));
  });
});

socket.on('message', async (data) => {
  try {
    const parsed = JSON.parse(data);

    if (parsed.arg?.channel === 'ticker' && parsed.data) {
      const ticker = parsed.data;
      const symbol = parsed.arg.instId;
      const price = parseFloat(ticker.last);
      const volume = parseFloat(ticker.vol24h);

      // Save or update in MongoDB
      await Market.findOneAndUpdate(
        { symbol },
        { price, volume, updatedAt: new Date() },
        { upsert: true }
      );

      console.log(`✅ [${symbol}] Price: ${price}, Volume: ${volume}`);
    }
  } catch (err) {
    console.error('❌ Error processing Bitget data:', err.message);
  }
});

socket.on('error', (err) => {
  console.error('❌ Bitget WebSocket error:', err.message);
});
