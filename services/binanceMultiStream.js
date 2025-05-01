// ✅ services/binanceMultiStream.js
const WebSocket = require('ws');
const Trade = require('../models/Trade');
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

// use socket.io from global.io
const io = global.io;

const symbols = ['btcusdt', 'ethusdt', 'bnbusdt'];

symbols.forEach((symbol) => {
  const tradeSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
  tradeSocket.on('message', async (data) => {
    const trade = JSON.parse(data);
    const tradeData = {
      symbol,
      price: parseFloat(trade.p),
      qty: parseFloat(trade.q),
      timestamp: trade.T,
      isBuyerMaker: trade.m
    };
    io.emit(`tradeUpdate-${symbol}`, tradeData);
    await Trade.create(tradeData);
  });

  const depthSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth`);
  depthSocket.on('message', async (data) => {
    const depth = JSON.parse(data);
    const orderBookData = {
      symbol,
      bids: depth.bids,
      asks: depth.asks,
      lastUpdateId: depth.u
    };
    io.emit(`orderBookUpdate-${symbol}`, orderBookData);
    await OrderBookSnapshot.create(orderBookData);
  });
});
