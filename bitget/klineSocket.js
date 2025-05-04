const WebSocket = require('ws');
const Kline = require('../models/Kline');

const symbols = ['btcusdt', 'ethusdt']; // Add more pairs as needed
const interval = '1m'; // Available: 1m, 5m, 15m, 30m, 1h, 4h, 1d

function subscribeKline(ws, symbol) {
  const payload = {
    op: 'subscribe',
    args: [
      {
        instType: 'SPOT',
        channel: `candle${interval}`,
        instId: symbol.toUpperCase(),
      },
    ],
  };

  ws.send(JSON.stringify(payload));
}

function handleKlineMessage(data) {
  const { arg, data: candles } = data;
  const symbol = arg.instId.toUpperCase();

  candles.forEach(async (candle) => {
    const [
      openTime,
      open,
      high,
      low,
      close,
      volume,
      quoteVolume,
      closeTime
    ] = candle;

    const existing = await Kline.findOne({ symbol, openTime });

    if (!existing) {
      const kline = new Kline({
        symbol,
        openTime: parseInt(openTime),
        open,
        high,
        low,
        close,
        volume,
        closeTime: parseInt(closeTime),
        interval,
      });

      kline.save()
        .then(() => console.log(`📊 Kline saved for ${symbol} - ${openTime}`))
        .catch(err => console.error('❌ Kline save error:', err.message));
    }
  });
}

function connectBitgetKlineSocket() {
  const ws = new WebSocket('wss://ws.bitget.com/spot/v1/stream');

  ws.on('open', () => {
    console.log('🔌 Connected to Bitget Kline WebSocket');
    symbols.forEach(symbol => subscribeKline(ws, symbol));
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.event === 'subscribe') {
        console.log('✅ Subscribed to klines:', data.arg.instId);
      } else if (data.arg?.channel?.includes('candle') && data.data) {
        handleKlineMessage(data);
      }
    } catch (err) {
      console.error('❌ Kline message parse error:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.log('❌ Kline socket closed. Reconnecting in 5s...');
    setTimeout(connectBitgetKlineSocket, 5000);
  });
}

module.exports = connectBitgetKlineSocket;
