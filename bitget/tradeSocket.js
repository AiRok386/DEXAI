const WebSocket = require('ws');
const Trade = require('../models/Trade');

const symbols = ['btcusdt', 'ethusdt']; // Add more symbols as needed

function subscribeTrade(ws, symbol) {
  const payload = {
    op: 'subscribe',
    args: [
      {
        instType: 'SPOT',
        channel: 'trade',
        instId: symbol.toUpperCase(),
      },
    ],
  };

  ws.send(JSON.stringify(payload));
}

function handleTradeMessage(data) {
  const { arg, data: trades } = data;
  const symbol = arg.instId.toUpperCase();

  trades.forEach((t) => {
    const trade = new Trade({
      symbol,
      price: t.p,
      size: t.sz,
      side: t.side, // 'buy' or 'sell'
      timestamp: parseInt(t.ts),
    });

    trade.save()
      .then(() => console.log(`💹 Trade saved for ${symbol}`))
      .catch(err => console.error(`❌ Error saving trade for ${symbol}:`, err.message));
  });
}

function connectBitgetTradeSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget Trade WebSocket');
    symbols.forEach(symbol => subscribeTrade(ws, symbol));
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.event === 'subscribe') {
        console.log('✅ Subscribed to trades:', data.arg.instId);
      } else if (data.arg?.channel === 'trade' && data.data) {
        handleTradeMessage(data);
      }
    } catch (err) {
      console.error('❌ Trade message parse error:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.log('❌ WebSocket closed. Reconnecting in 5s...');
    setTimeout(connectBitgetTradeSocket, 5000);
  });
}

module.exports = connectBitgetTradeSocket;
