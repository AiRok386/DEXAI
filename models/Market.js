// models/Market.js

const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    index: true // Faster querying
  },
  price: {
    type: Number,
    required: true
  },
  priceChangePercent: {
    type: Number,
    required: true
  },
  highPrice: {
    type: Number,
    required: true
  },
  lowPrice: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  quoteVolume: {
    type: Number,
    required: true
  },
  openPrice: {
    type: Number,
    required: true
  },
  closeTime: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Market', MarketSchema);
