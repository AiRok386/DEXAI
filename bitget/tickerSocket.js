const WebSocket = require('ws');
const Ticker = require('../models/Ticker');
// const Trade = require('../models/Trade'); // Uncomment if saving trade data
const { parseTradeData, parseTickerData } = require('../utils/parseHelpers'); // optional utils

const socketURL = 'wss://ws.bitget.com/spot/v1/stream';
let socket;

const symbols = ['btcusdt', 'ethusdt']; // Add more symbols here

function createSubscriptionArgs(tokens, channel) {
  return tokens.map(symbol => ({
    instType: 'SPOT',
    channel,
    instId: symbol.toUpperCase(),
  }));
}

function subscribeToChannels(tokens) {
  const channels = ['ticker', 'trade'];
  channels.forEach(channel => {
    const args = createSubscriptionArgs(tokens, channel);
    socket.send(JSON.stringify({ op: 'subscribe', args }));
  });
}

function handleMessage(raw) {
  try {
    const message = JSON.parse(raw);

    const { arg, data } = message;
    if (!arg || !data || !data.length) return;

    const symbol = arg.instId.toUpperCase();
    const channel = arg.channel;

    if (channel === 'ticker') {
      const tick = data[0];
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
        .catch(err => console.error(`❌ Error saving ticker for ${symbol}:`, err.message));
    }

    if (channel === 'trade') {
      console.log(`💱 Trade update for ${symbol}:`, JSON.stringify(data[0]));
      // Optional: save to Trade model here
    }

  } catch (err) {
    console.error('❌ WebSocket message parse error:', err.message);
  }
}

function connectBitgetSocket(tokens) {
  if (!tokens || tokens.length === 0) {
    console.warn('⚠️ No tokens provided to WebSocket');
    return;
  }

  socket = new WebSocket(socketURL);

  socket.on('open', () => {
    console.log('🔌 Connected to Bitget WebSocket');
    subscribeToChannels(tokens);
  });

  socket.on('message', handleMessage);

  socket.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
  });

  socket.on('close', () => {
    console.warn('❌ WebSocket closed. Reconnecting in 5s...');
    setTimeout(() => connectBitgetSocket(tokens), 5000);
  });
}

module.exports = { connectBitgetSocket };
