const WebSocket = require('ws');
const Kline = require('../models/Kline');

const WS_URL = 'wss://ws.bitget.com/spot/v1/stream';
const interval = '1m'; // Supported intervals: 1m, 5m, 15m, 30m, 1h, 4h, 1d

function createKlineSubscriptionPayload(tokens) {
  const args = tokens.map(symbol => ({
    instType: 'SPOT',
    channel: `candle${interval}`,
    instId: symbol.toUpperCase(),
  }));

  return { op: 'subscribe', args };
}

async function handleKlineMessage(message) {
  const { arg, data: candles } = message;
  const symbol = arg.instId.toUpperCase();

  for (const candle of candles) {
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

    const exists = await Kline.findOne({ symbol, openTime });
    if (!exists) {
      const newKline = new Kline({
        symbol,
        interval,
        openTime: parseInt(openTime),
        closeTime: parseInt(closeTime),
        open,
        high,
        low,
        close,
        volume,
      });

      newKline.save()
        .then(() => console.log(`🕯️ Kline saved for ${symbol} at ${openTime}`))
        .catch(err => console.error(`❌ Failed to save kline for ${symbol}:`, err.message));
    }
  }
}

function connectBitgetKlineSocket(tokens) {
  if (!tokens || tokens.length === 0) {
    console.warn('⚠️ No tokens provided to Kline WebSocket');
    return;
  }

  const socket = new WebSocket(WS_URL);

  socket.on('open', () => {
    console.log('🔌 Connected to Bitget Kline WebSocket');
    const subscription = createKlineSubscriptionPayload(tokens);
    socket.send(JSON.stringify(subscription));
  });

  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.event === 'subscribe') {
        console.log(`✅ Subscribed to ${data.arg.channel} for ${data.arg.instId}`);
      } else if (data.arg?.channel?.includes('candle') && data.data) {
        handleKlineMessage(data);
      }
    } catch (err) {
      console.error('❌ Failed to parse kline message:', err.message);
    }
  });

  socket.on('error', (err) => {
    console.error('❌ Kline WebSocket error:', err.message);
  });

  socket.on('close', () => {
    console.warn('❌ Kline WebSocket closed. Reconnecting in 5s...');
    setTimeout(() => connectBitgetKlineSocket(tokens), 5000);
  });
}

module.exports = { connectBitgetKlineSocket };
