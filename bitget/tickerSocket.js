const WebSocket = require('ws');
const Ticker = require('../models/Ticker'); // MongoDB model to store ticker info

const symbols = ['btcusdt', 'ethusdt']; // Add more symbols as needed

function subscribeTicker(ws, symbol) {
  const payload = {
    op: 'subscribe',
    args: [
      {
        instType: 'SPOT',
        channel: 'ticker',
        instId: symbol.toUpperCase(),
      },
    ],
  };
  ws.send(JSON.stringify(payload));
}

function handleTickerMessage(data) {
  const { arg, data: [tick] } = data;
  const symbol = arg.instId.toUpperCase();

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
    .then(() => console.log(💹 Ticker updated for ${symbol}))
    .catch(err => console.error(❌ Error saving ticker for ${symbol}:, err.message));
}

function connectBitgetTickerSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget Ticker WebSocket');
    symbols.forEach(symbol => subscribeTicker(ws, symbol));
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.arg?.channel === 'ticker' && data.data?.length) {
        handleTickerMessage(data);
      }
    } catch (err) {
      console.error('❌ Ticker message parse error:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ Ticker WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.log('❌ Ticker WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectBitgetTickerSocket, 5000);
  });
}

module.exports = connectBitgetTickerSocket;
