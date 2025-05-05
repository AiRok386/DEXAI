// models/Market.js

const mongoose = require('mongoose');

// Market price and 24h stats for a symbol
const MarketSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },

  // Price stats
  lastPrice: { type: Number, required: true },         // Latest price
  high24h: { type: Number, required: true },            // 24h high
  low24h: { type: Number, required: true },             // 24h low
  volume24h: { type: Number, required: true },          // 24h volume
  change24h: { type: Number, required: true },          // Absolute price change in 24h
  priceChangePercent: { type: Number, required: true }, // Percentage change

  // Updated timestamp
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Market', MarketSchema);
