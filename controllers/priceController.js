// controllers/priceController.js

const WebSocket = require('ws');
const Price = require('../models/Price');
const OrderBook = require('../models/OrderBook');

// In-memory live price cache
const livePrices = {};

// Supported trading pairs
const tradingPairs = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

// Dummy order book simulator based on live price
function generateOrderBook(price) {
  const bids = Array.from({ length: 5 }, (_, i) => [
    (price - i * (price * 0.002)).toFixed(4),
    (Math.random() * 5).toFixed(4)
  ]);
  const asks = Array.from({ length: 5 }, (_, i) => [
    (price + i * (price * 0.002)).toFixed(4),
    (Math.random() * 5).toFixed(4)
  ]);
  return { bids, asks };
}

// Connect to Bitget WebSocket and process real-time ticker data
function startPriceStream() {
  const ws = new WebSocket('wss://ws.bitget.com/v2/ws/public');

  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket for prices');

    const subscribeMessage = {
      op: 'subscribe',
      args: tradingPairs.map(pair => ({
        instType: 'SPOT',
        channel: 'ticker',
        instId: pair
      }))
    };

    ws.send(JSON.stringify(subscribeMessage));

    // Keep alive
    setInterval(() => ws.send('ping'), 30000);
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.action === 'snapshot' && Array.isArray(msg.data)) {
        for (const ticker of msg.data) {
          const { instId, lastPr, high24h, low24h, open24h, quoteVol24h } = ticker;
          const symbol = instId.toLowerCase();
          const price = parseFloat(lastPr);
          const volume = parseFloat(quoteVol24h);
          const changePercent24Hr = ((price - parseFloat(open24h)) / parseFloat(open24h)) * 100;

          livePrices[symbol] = price;

          // Update DB: Price
          await Price.findOneAndUpdate(
            { symbol },
            {
              symbol,
              name: instId, // You can map real names if needed
              price,
              volume,
              changePercent24Hr,
              updatedAt: new Date()
            },
            { upsert: true }
          );

          // Generate dummy order book and update DB
          const { bids, asks } = generateOrderBook(price);
          await OrderBook.findOneAndUpdate(
            { symbol },
            { symbol, bids, asks, updatedAt: new Date() },
            { upsert: true }
          );

          console.log(`💰 Updated ${instId} | $${price}`);
        }
      }
    } catch (err) {
      console.error('❌ Error processing WebSocket data:', err);
    }
  });

  ws.on('error', err => console.error('❌ WS error:', err));
  ws.on('close', () => {
    console.log('🔁 WebSocket closed. Reconnecting...');
    setTimeout(startPriceStream, 5000);
  });
}

module.exports = {
  startPriceStream
};
