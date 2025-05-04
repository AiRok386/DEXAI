// models/Market.js

const mongoose = require('mongoose');

// Define the schema for market data
const MarketSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  price: { type: Number },
  priceChangePercent: { type: Number },
  highPrice: { type: Number },
  lowPrice: { type: Number },
  lastPrice: { type: Number, required: true },
  high24h: { type: Number, required: true },
  low24h: { type: Number, required: true },
  change24h: { type: Number, required: true },
  volume24h: { type: Number, required: true },
  bids: [{ price: Number, quantity: Number }],
  
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Market', MarketSchema);
