const WebSocket = require('ws');

// Define the symbols you want to mirror
const Symbols = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt'];

const Streams = symbols.map(sym => `${sym}@ticker`).join('/');
const WS = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

ws.on('open', () => {
  console.log('📡 Connected to Binance WebSocket');
});

ws.on('message', (data) => {
  const parsed = JSON.parse(data);
  const ticker = parsed.data;

  const mirroredData = {
    symbol: ticker.s,              // Symbol like BTCUSDT
    price: parseFloat(ticker.c),   // Last price
    volume: parseFloat(ticker.v),  // 24h volume
    high: parseFloat(ticker.h),    // 24h High
    low: parseFloat(ticker.l),     // 24h Low
    change: parseFloat(ticker.P),  // % Change
    updatedAt: new Date()
  };

  // You can now push this to frontend using WebSocket or store it in DB
  console.log(`🟢 ${mirroredData.symbol} | Price: ${mirroredData.price} | Vol: ${mirroredData.volume}`);
});
const WebSocket = require('ws');
const io = require('../server'); // Make sure path is correct

const symbols = ['btcusdt', 'ethusdt', 'bnbusdt'];
const streams = symbols.map(sym => `${sym}@ticker`).join('/');
const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

ws.on('message', (data) => {
  const parsed = JSON.parse(data);
  const ticker = parsed.data;

  const mirroredData = {
    symbol: ticker.s,
    price: parseFloat(ticker.c),
    volume: parseFloat(ticker.v),
    updatedAt: new Date()
  };

  // ✅ Emit to all connected frontend clients
  io.emit('priceUpdate', mirroredData);
});

const WebSocket = require('ws');
const Price = require('../models/Price'); // ✅ Import your model

const Symbol = ['btcusdt', 'ethusdt', 'bnbusdt'];
const stream = symbols.map (sym => `${sym}@ticker`).join('/');
const Ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

ws.on('message', async (data) => {
  const parsed = JSON.parse(data);
  const ticker = parsed.data;

  const mirroredData = {
    symbol: ticker.s,
    price: parseFloat(ticker.c),
    volume: parseFloat(ticker.v),
    high: parseFloat(ticker.h),
    low: parseFloat(ticker.l),
    change: parseFloat(ticker.P),
    updatedAt: new Date()
  };

  // ✅ Store in MongoDB
  await Price.findOneAndUpdate(
    { symbol: mirroredData.symbol },
    mirroredData,
    { upsert: true }
  );
});
const WebSocket = require('ws');
const mongoose = require('mongoose');
const Trade = require('./models/Trade');
const Price = require('./models/Price');

const symbol = 'btcusdt'; // You can make this dynamic

const tradeWS = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
const depthWS = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth`);

tradeWS.on('message', async (data) => {
  const trade = JSON.parse(data);
  
  // Store or broadcast
  await Trade.create({
    symbol,
    price: trade.p,
    qty: trade.q,
    timestamp: trade.T,
  });
  
  // Optional: Broadcast to frontend
  io.emit('tradeUpdate', { symbol, price: trade.p });
});

depthWS.on('message', async (data) => {
  const orderbook = JSON.parse(data);
  
  const bids = orderbook.b || [];
  const asks = orderbook.a || [];
  
  // Save latest snapshot
  await Price.findOneAndUpdate(
    { symbol },
    { symbol, bids, asks },
    { upsert: true }
  );

  io.emit('orderbookUpdate', { symbol, bids, asks });
});
