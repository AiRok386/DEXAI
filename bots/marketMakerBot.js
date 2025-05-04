// bots/marketMakerBot.js

const Order = require('../models/Order.model');
const Token = require('../models/token.model');
const randomFloat = require('../utils/randomFloat');
const { getMarketCache } = require('../cache/marketCache'); // ✅ In-memory price store from Bitget WS

const SPREAD_PERCENT = 0.5; // Buy/Sell spread %
const MIN_ORDER_AMOUNT = 0.01;
const MAX_ORDER_AMOUNT = 5.0;
const BOT_INTERVAL_MS = 10000;

let isBotRunning = false;
let botInterval = null;

// ✅ Market maker bot logic
async function runMarketMaker() {
  if (!isBotRunning) return;

  try {
    const tokens = await Token.find({ active: true });
    const marketPrices = getMarketCache(); // In-memory price cache from Bitget WebSocket

    for (const token of tokens) {
      const symbol = token.symbol.toLowerCase(); // e.g., btc
      const pair = `${symbol}usdt`.toUpperCase(); // e.g., BTCUSDT

      const liveData = marketPrices[pair];
      if (!liveData || !liveData.price) {
        console.warn(`⚠️ No live price for ${pair}`);
        continue;
      }

      const basePrice = parseFloat(liveData.price);

      // Create Buy Order
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

      // Create Sell Order
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

      console.log(`🤖 Bot placed Buy/Sell for ${token.symbol} @ ${basePrice}`);
    }
  } catch (err) {
    console.error('❌ Market Maker Bot Error:', err.message);
  }
}

// ✅ Start the bot
function startBot() {
  if (isBotRunning) return;

  isBotRunning = true;
  botInterval = setInterval(runMarketMaker, BOT_INTERVAL_MS);
  console.log('🚀 Market Maker Bot Started');
}

// ✅ Stop the bot
function stopBot() {
  if (!isBotRunning) return;

  clearInterval(botInterval);
  isBotRunning = false;
  console.log('🛑 Market Maker Bot Stopped');
}

module.exports = { startBot, stopBot };
