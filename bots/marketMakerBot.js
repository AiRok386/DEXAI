const Order = require('../models/Order.model');
const Token = require('../models/token.model');
const randomFloat = require('../utils/randomFloat');
const axios = require('axios'); // Use axios for fetching prices

const SPREAD_PERCENT = 0.5; // % spread between buy/sell
const MIN_ORDER_AMOUNT = 0.01;
const MAX_ORDER_AMOUNT = 5.0;
const BOT_INTERVAL_MS = 10000; // 10 seconds

let isBotRunning = false;
let botInterval = null;

// ✅ Fetch live price from an API like Binance or CoinCap
async function fetchPrice(symbol) {
  try {
    // Binance API endpoint for live price
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}USDT`;
    const response = await axios.get(url);
    return parseFloat(response.data.price);
  } catch (error) {
    console.error('❌ Error fetching price from Binance:', error.message);
    return null;
  }
}

// ✅ Main logic to place market maker orders
async function runMarketMaker() {
  if (!isBotRunning) return;

  try {
    const tokens = await Token.find({ active: true });

    for (const token of tokens) {
      const symbol = token.symbol.toLowerCase(); // e.g., 'btc' -> 'bitcoin'

      // Fetch the real-time price for the token from Binance or another API
      const basePrice = await fetchPrice(symbol);
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

      console.log(`📈 Bot placed Buy/Sell orders for ${token.symbol} at ${basePrice}`);
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
