// bitget/tickerSocket.js

const WebSocket = require('ws');
const Ticker = require('../models/Ticker');

// List of top trading symbols (modify as needed)
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

// Function to connect and manage Bitget Ticker WebSocket
function connectBitgetTickerSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('✅ Connected to Bitget Ticker WebSocket');

    const subscribePayload = {
      op: 'subscribe',
      args: allowedSymbols.map(symbol => ({
        instType: 'SPOT',
        channel: 'ticker',
        instId: symbol
      }))
    };

    ws.send(JSON.stringify(subscribePayload));
  });

  ws.on('message', async (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.arg?.channel === 'ticker' && Array.isArray(parsed.data)) {
        const tick = parsed.data[0];
        const symbol = parsed.arg.instId;

        const updatedTicker = {
          symbol,
          lastPrice: parseFloat(tick.last),
          open24h: parseFloat(tick.open24h),
          high24h: parseFloat(tick.high24h),
          low24h: parseFloat(tick.low24h),
          priceChangePercent: parseFloat(tick.changeUtc24h),
          baseVolume: parseFloat(tick.baseVolume),
          quoteVolume: parseFloat(tick.quoteVolume),
        };

        await Ticker.findOneAndUpdate(
          { symbol },
          updatedTicker,
          { upsert: true, new: true }
        );

        console.log(`💹 Ticker updated for ${symbol}`);
      }
    } catch (err) {
      console.error('❌ Failed to process ticker message:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ Bitget Ticker WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.warn('⚠️ Bitget Ticker WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectBitgetTickerSocket, 5000);
  });
}

module.exports = connectBitgetTickerSocket;
