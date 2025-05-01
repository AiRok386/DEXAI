// ✅ bots/marketMakerBot.js
const Order = require('../models/Order.model');
const Token = require('../models/token.model');
const randomFloat = require('../utils/randomFloat');

const SPREAD_PERCENT = 0.5;
const MIN_ORDER_AMOUNT = 0.01;
const MAX_ORDER_AMOUNT = 5.0;
const BOT_INTERVAL_MS = 10000;

let isBotRunning = false;

async function runMarketMaker() {
  if (!isBotRunning) return;

  try {
    const tokens = await Token.find({ active: true });
    for (const token of tokens) {
      const basePrice = token.currentPrice;
      if (!basePrice) continue;

      const buyPrice = basePrice * (1 - (SPREAD_PERCENT / 100));
      const buyAmount = randomFloat(MIN_ORDER_AMOUNT, MAX_ORDER_AMOUNT);

      await Order.create({
        userId: 'bot',
        tokenSymbol: token.symbol,
        price: buyPrice.toFixed(6),
        amount: buyAmount.toFixed(6),
        type: 'buy',
        status: 'open'
      });

      const sellPrice = basePrice * (1 + (SPREAD_PERCENT / 100));
      const sellAmount = randomFloat(MIN_ORDER_AMOUNT, MAX_ORDER_AMOUNT);

      await Order.create({
        userId: 'bot',
        tokenSymbol: token.symbol,
        price: sellPrice.toFixed(6),
        amount: sellAmount.toFixed(6),
        type: 'sell',
        status: 'open'
      });

      console.log(`🛒 Bot placed Buy/Sell for ${token.symbol}`);
    }
  } catch (err) {
    console.error('❌ Bot Error:', err);
  }
}

function startBot() {
  if (isBotRunning) return;
  isBotRunning = true;
  setInterval(runMarketMaker, BOT_INTERVAL_MS);
  console.log('🚀 Market Maker Bot Started.');
}

function stopBot() {
  isBotRunning = false;
  console.log('🛑 Market Maker Bot Stopped.');
}

module.exports = { startBot, stopBot };
