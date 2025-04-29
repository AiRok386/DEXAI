const mongoose = require('mongoose');
const Order = require('../models/Order'); // Your real order model
const Token = require('../models/Token'); // Your listed tokens
const randomFloat = require('../utils/randomFloat');

// CONFIG - You can control from Admin Panel later
const SPREAD_PERCENT = 0.5; // 0.5% price gap between buy/sell
const MIN_ORDER_AMOUNT = 0.01; // min 0.01 token
const MAX_ORDER_AMOUNT = 5.0; // max 5 token
const BOT_INTERVAL_MS = 10000; // every 10 sec

let isBotRunning = false;

// Function to create market making orders
async function runMarketMaker() {
    if (!isBotRunning) return;

    try {
        const tokens = await Token.find({ active: true });

        for (const token of tokens) {
            const basePrice = token.currentPrice; // pull latest market price
            if (!basePrice) continue;

            // Random buy order
            const buyPrice = basePrice * (1 - (SPREAD_PERCENT / 100));
            const buyAmount = randomFloat(MIN_ORDER_AMOUNT, MAX_ORDER_AMOUNT);

            await Order.create({
                userId: 'bot', // Mark bot-created orders
                tokenSymbol: token.symbol,
                price: buyPrice.toFixed(6),
                amount: buyAmount.toFixed(6),
                type: 'buy',
                status: 'open'
            });

            // Random sell order
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

// Start Bot
function startBot() {
    if (isBotRunning) return;
    isBotRunning = true;
    setInterval(runMarketMaker, BOT_INTERVAL_MS);
    console.log('🚀 Market Maker Bot Started.');
}

// Stop Bot
function stopBot() {
    isBotRunning = false;
    console.log('🛑 Market Maker Bot Stopped.');
}

module.exports = { startBot, stopBot };
// After placing new orders
const updatedOrderBook = await fetchOrderBookFromDatabase(); // your order book generator
io.emit('orderbookUpdate', updatedOrderBook); // Push to frontend WebSocket
