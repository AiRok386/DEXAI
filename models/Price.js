const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  symbol: { type: String, unique: true },
  price: Number,
  volume: Number,
  high: Number,
  low: Number,
  change: Number,
  updatedAt: Date
});

module.exports = mongoose.model('Price', priceSchema);
