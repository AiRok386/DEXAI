const axios = require('axios');

let io; // Socket.IO will be assigned in init()

// Replace with the asset you want to track (e.g., bitcoin, ethereum, etc.)
const SYMBOL = 'bitcoin';
const API_URL = `https://api.coincap.io/v2/assets/${SYMBOL}`;
let lastPrice = null;

const fetchPriceAndEmit = async () => {
  try {
    const response = await axios.get(API_URL);
    const asset = response.data.data;

    if (!asset || !asset.priceUsd) return;

    const price = parseFloat(asset.priceUsd).toFixed(2);
    const timestamp = Date.now();
    const qty = (Math.random() * 0.5 + 0.01).toFixed(5); // simulate random volume
    const isBuyerMaker = Math.random() < 0.5;

    // Skip if price hasn't changed to prevent spam
    if (price === lastPrice) return;
    lastPrice = price;

    io.emit('tradeUpdate', {
      price,
      qty,
      timestamp,
      isBuyerMaker,
    });

    console.log(`📡 Emitted trade: $${price} | Qty: ${qty}`);
  } catch (err) {
    console.error('❌ Failed to fetch price:', err.message);
  }
};

const initTradeStream = (socketIOInstance) => {
  io = socketIOInstance;
  setInterval(fetchPriceAndEmit, 5000); // Fetch every 5 seconds
};

module.exports = initTradeStream;
