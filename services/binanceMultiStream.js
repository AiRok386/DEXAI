const WebSocket = require('ws');
const io = require('../server'); // adjust path to your socket server

// 🔁 Coins you want to mirror (add more as needed)
const symbols = ['btcusdt', 'ethusdt', 'bnbusdt'];

// ✅ Create individual streams for each symbol
symbols.forEach((symbol) => {
  // Trade Stream
  const tradeSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);

  tradeSocket.on('message', (data) => {
    const trade = JSON.parse(data);
    io.emit(`tradeUpdate-${symbol}`, {
      symbol,
      price: trade.p,
      qty: trade.q,
      timestamp: trade.T,
      isBuyerMaker: trade.m,
    });
  });

  // Order Book (Depth Stream)
  const depthSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth`);

  depthSocket.on('message', (data) => {
    const depth = JSON.parse(data);
    io.emit(`orderBookUpdate-${symbol}`, {
      symbol,
      bids: depth.bids,
      asks: depth.asks,
      lastUpdateId: depth.u,
    });
  });
});
const WebSocket = require('ws');
const io = require('../server');
const Trade = require('../models/Trade');
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

const Symbol = ['btcusdt', 'ethusdt', 'bnbusdt'];

symbols.forEach((symbol) => {
  // 🟡 Trade Stream
  const tradeSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);

  tradeSocket.on('message', async (data) => {
    const trade = JSON.parse(data);

    const tradeData = {
      symbol,
      price: parseFloat(trade.p),
      qty: parseFloat(trade.q),
      timestamp: trade.T,
      isBuyerMaker: trade.m,
    };

    io.emit(`tradeUpdate-${symbol}`, tradeData);

    // ✅ Store in DB
    await Trade.create(tradeData);
  });

  // 🟣 Depth Stream (Order Book)
  const depthSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth`);

  depthSocket.on('message', async (data) => {
    const depth = JSON.parse(data);

    const orderBookData = {
      symbol,
      bids: depth.bids,
      asks: depth.asks,
      lastUpdateId: depth.u,
    };

    io.emit(`orderBookUpdate-${symbol}`, orderBookData);

    // ✅ Store in DB
    await OrderBookSnapshot.create(orderBookData);
  });
});
