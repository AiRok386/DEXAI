// models/market.model.js
const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  symbol: String,
  baseAsset: String,
  quoteAsset: String,
  price: String,
  volume: String,
});

module.exports = mongoose.model('Market', marketSchema);
