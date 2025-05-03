// models/Market.js
const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  baseAsset: { type: String, required: true },
  quoteAsset: { type: String, required: true },
  price: { type: Number, required: true },
  volume: { type: Number, required: true },
  priceChangePercent: { type: Number },
  highPrice: { type: Number },
  lowPrice: { type: Number },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Market', marketSchema);
