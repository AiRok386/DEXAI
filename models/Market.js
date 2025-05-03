// models/Market.js

const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  price: Number,
  priceChangePercent: Number,
  highPrice: Number,
  lowPrice: Number,
  volume: Number,
  quoteVolume: Number,
  openPrice: Number,
  closeTime: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Market', MarketSchema);
