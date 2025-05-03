// marketMakerBot.js - Using Binance REST API instead of CoinCap

const axios = require('axios');
const Order = require('../models/Order.model');
const Token = require('../models/token.model');
const randomFloat = require('../utils/randomFloat');

const SPREAD_PERCENT = 0.5; // % spread between buy/sell
const MIN_ORDER_AMOUNT = 0.01;
const MAX_ORDER_AMOUNT = 5.0;
const BOT_INTERVAL_MS = 10000; // 10 seconds

let isBotRunning = false;
let botInterval = null;

// ✅ Fetch live price from Binance REST API\async function fetchBinancePrice(symbol) {
  try {
    const pair = `${symbol.toLowerCase()}usdt`; // e.g., btcusdt
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${pair.toUpperCase()}`;
    const response = await axios.get(url);
    return parseFloat(response.data.price);
  } catch (error) {
    console.error(`❌ Failed to fetch Binance price for ${symbol}:`, error.message);
    return null;
  }
}

// ✅ Main logic to place market maker orders
async function runMarketMaker() {
  if (!isBotRunning) return;

  try {
    const tokens = await Token.find({ active: true });

    for (const token of tokens) {
      const symbol = token.symbol.toLowerCase();

      const basePrice = await fetchBinancePrice(symbol);
      if (!basePrice) continue;

      // Buy order
      const buyPrice = basePrice * (1 - SPREAD_PERCENT / 100);
      const buyAmount = randomFloat(MIN_ORDER_AMOUNT, MAX_ORDER_AMOUNT);

      await Order.create({
        userId: 'bot',
        tokenSymbol: token.symbol,
        price: buyPrice.toFixed(6),
        amount: buyAmount.toFixed(6),
        type: 'buy',
        status: 'open',
      });

      // Sell order
      const sellPrice = basePrice * (1 + SPREAD_PERCENT / 100);
      const sellAmount = randomFloat(MIN_ORDER_AMOUNT, MAX_ORDER_AMOUNT);

      await Order.create({
        userId: 'bot',
        tokenSymbol: token.symbol,
        price: sellPrice.toFixed(6),
        amount: sellAmount.toFixed(6),
        type: 'sell',
        status: 'open',
      });

      console.log(`🤖 Placed buy/sell orders for ${token.symbol} at base price ${basePrice}`);
    }
  } catch (err) {
    console.error('❌ Market Maker Bot Error:', err);
  }
}

// ✅ Start the bot
function startBot() {
  if (isBotRunning) return;

  isBotRunning = true;
  botInterval = setInterval(runMarketMaker, BOT_INTERVAL_MS);
  console.log('🚀 Market Maker Bot Started.');
}

// ✅ Stop the bot
function stopBot() {
  if (!isBotRunning) return;

  clearInterval(botInterval);
  isBotRunning = false;
  console.log('🛑 Market Maker Bot Stopped.');
}

module.exports = { startBot, stopBot };
