// scripts/fetchTokenListFromBitget.js

const mongoose = require('mongoose');
const axios = require('axios');
const Token = require('../models/token.model');
require('dotenv').config();

// Replace with your MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-exchange';

// Number of top tokens to fetch
const TOP_N = 15;

async function fetchAndStoreTokens() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const response = await axios.get('https://api.bitget.com/api/spot/v1/market/tickers');
    const tickers = response.data.data;

    if (!tickers || tickers.length === 0) {
      console.error('❌ No ticker data received from Bitget');
      return;
    }

    // Sort tokens by 24h volume (descending)
    const sorted = tickers
      .filter(t => t.symbol.endsWith('USDT')) // only USDT pairs
      .sort((a, b) => parseFloat(b.baseVolume) - parseFloat(a.baseVolume))
      .slice(0, TOP_N);

    for (const token of sorted) {
      const symbol = token.symbol;
      const existing = await Token.findOne({ symbol });

      if (existing) {
        console.log(`🔁 Token ${symbol} already exists`);
        continue;
      }

      const newToken = new Token({
        symbol: symbol,
        currentPrice: parseFloat(token.last),
        volume: parseFloat(token.baseVolume),
        priceChangePercent: parseFloat(token.changeUtc),
        highPrice: parseFloat(token.high24h),
        lowPrice: parseFloat(token.low24h),
        active: true
      });

      await newToken.save();
      console.log(`✅ Added ${symbol} | $${newToken.currentPrice}`);
    }

    console.log('🚀 Token import complete.');
    process.exit();
  } catch (err) {
    console.error('❌ Error fetching tokens:', err.message);
    process.exit(1);
  }
}

fetchAndStoreTokens();
