const WebSocket = require('ws');
const Ticker = require('../models/Ticker');
// const Trade = require('../models/Trade'); // Uncomment if needed
// const { parseTickerData, parseTradeData } = require('../utils/parseHelpers'); // Optional

const WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
let socket;

function createSubscriptionPayload(tokens, channels = ['ticker', 'trade']) {
  const args = [];

  channels.forEach(channel => {
    tokens.forEach(symbol => {
      args.push({
        instType: 'SPOT',
        channel,
        instId: symbol.toUpperCase(),
      });
    });
  });

  return { op: 'subscribe', args };
}

function handleWebSocketMessage(message) {
  try {
    const data = JSON.parse(message);
    const { arg, data: payload } = data;

    if (!arg || !payload?.length) return;

    const symbol = arg.instId.toUpperCase();
    const channel = arg.channel;

    if (channel === 'ticker') {
      const tick = payload[0];

      const newTicker = {
        symbol,
        lastPrice: tick.last,
        open24h: tick.open24h,
        high24h: tick.high24h,
        low24h: tick.low24h,
        priceChangePercent: tick.changeUtc24h,
        baseVolume: tick.baseVolume,
        quoteVolume: tick.quoteVolume,
      };

      Ticker.findOneAndUpdate({ symbol }, newTicker, { upsert: true, new: true })
        .then(() => console.log(`💹 Ticker updated for ${symbol}`))
        .catch(err => console.error(`❌ Failed to save ticker for ${symbol}:`, err.message));
    }

    if (channel === 'trade') {
      console.log(`💱 Trade update for ${symbol}:`, JSON.stringify(payload[0]));
      // Save to Trade model if needed
    }

  } catch (err) {
    console.error('❌ Failed to parse WebSocket message:', err.message);
  }
}

function connectBitgetTickerSocket(tokens) {
  if (!tokens || tokens.length === 0) {
    console.warn('⚠️ No tokens provided to Ticker WebSocket');
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.on('open', () => {
    console.log('🔌 Connected to Bitget Ticker WebSocket');
    const subscriptionPayload = createSubscriptionPayload(tokens, ['ticker', 'trade']);
    socket.send(JSON.stringify(subscriptionPayload));
  });

  socket.on('message', handleWebSocketMessage);

  socket.on('error', (err) => {
    console.error('❌ Ticker WebSocket error:', err.message);
  });

  socket.on('close', () => {
    console.warn('❌ Ticker WebSocket closed. Reconnecting in 5s...');
    setTimeout(() => connectBitgetTickerSocket(tokens), 5000);
  });
}

module.exports = { connectBitgetTickerSocket };
