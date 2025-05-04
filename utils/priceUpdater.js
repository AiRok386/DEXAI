// utils/priceUpdater.js

const WebSocket = require('ws');
const Token = require('../models/token.model');

const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
let ws;

/**
 * Subscribe to ticker updates for all active tokens
 */
async function subscribeToTickers() {
  const tokens = await Token.find({ active: true });
  if (!tokens.length) {
    console.warn('⚠️ No active tokens found to subscribe');
    return;
  }

  const args = tokens.map(token => ({
    instId: token.symbol.toUpperCase(), // e.g., BTCUSDT
    channel: 'ticker'
  }));

  const payload = {
    op: 'subscribe',
    args
  };

  ws.send(JSON.stringify(payload));
  console.log('📡 Subscribed to ticker updates for:', args.map(a => a.instId).join(', '));
}

/**
 * Handle incoming Bitget ticker messages and update DB
 */
async function handleTickerUpdate(msg) {
  try {
    const data = JSON.parse(msg);
    if (data?.arg?.channel !== 'ticker' || !data.data) return;

    const ticker = data.data[0];
    const symbol = data.arg.instId;

    const updated = await Token.findOneAndUpdate(
      { symbol },
      {
        currentPrice: parseFloat(ticker.lastPr),
        volume: parseFloat(ticker.baseVol),
        priceChangePercent: parseFloat(ticker.change24h),
        highPrice: parseFloat(ticker.high24h),
        lowPrice: parseFloat(ticker.low24h),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (updated) {
      console.log(`✅ ${symbol} updated | $${updated.currentPrice} | Vol: ${updated.volume}`);
    }
  } catch (err) {
    console.error('❌ Failed to handle ticker update:', err.message);
  }
}

/**
 * Start the Bitget WebSocket connection and handle ticker data
 */
function startPriceUpdater() {
  ws = new WebSocket(BITGET_WS_URL);

  ws.on('open', async () => {
    console.log('🔌 Connected to Bitget WebSocket');
    await subscribeToTickers();
  });

  ws.on('message', handleTickerUpdate);

  ws.on('error', (err) => {
    console.error('❌ Bitget WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.warn('⚠️ Bitget WebSocket closed. Reconnecting in 5 seconds...');
    setTimeout(startPriceUpdater, 5000);
  });
}

module.exports = { startPriceUpdater };
