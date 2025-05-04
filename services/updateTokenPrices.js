const WebSocket = require('ws');
const Token = require('../models/Token'); // Mongoose model
const { saveTickerDataToDB } = require('../utils/tokenHelpers'); // Helper to store in DB

const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// Add the top tokens you want to subscribe to
const topTokens = [
  'BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'XRP-USDT', 'ADA-USDT',
  'DOGE-USDT', 'AVAX-USDT', 'SHIB-USDT', 'DOT-USDT', 'MATIC-USDT',
  'LTC-USDT', 'TRX-USDT', 'LINK-USDT', 'BCH-USDT', 'ATOM-USDT'
];

let ws;

const startPriceUpdater = () => {
  ws = new WebSocket(BITGET_WS_URL);

  ws.on('open', () => {
    console.log('✅ Connected to Bitget WebSocket for token prices');

    const subscribeMessage = {
      op: 'subscribe',
      args: topTokens.map(symbol => ({
        channel: 'spot/ticker',
        instId: symbol
      }))
    };

    ws.send(JSON.stringify(subscribeMessage));
  });

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data);

      if (parsed.arg?.channel === 'spot/ticker' && parsed.data?.length) {
        const ticker = parsed.data[0];

        const instId = parsed.arg.instId; // e.g., BTC-USDT
        const [symbol] = instId.split('-');
        const price = parseFloat(ticker.last).toFixed(4);
        const volume = parseFloat(ticker.baseVol).toFixed(2);
        const changePercent = parseFloat(ticker.changeUtc).toFixed(2);

        console.log(`📈 ${symbol}: $${price} (${changePercent}%)`);

        // Save or update in DB (optional)
        await Token.findOneAndUpdate(
          { symbol: symbol.toUpperCase() },
          {
            $set: {
              price,
              volume,
              changePercent,
              updatedAt: new Date()
            }
          },
          { upsert: true, new: true }
        );
      }
    } catch (err) {
      console.error('❌ Error processing ticker data:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget WebSocket error:', err);
  });

  ws.on('close', () => {
    console.log('🔌 Bitget WebSocket closed, attempting to reconnect in 5s...');
    setTimeout(startPriceUpdater, 5000); // Reconnect logic
  });
};

module.exports = startPriceUpdater;
