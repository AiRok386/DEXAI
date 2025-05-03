const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  price: Number,
  volume: Number,
  priceChangePercent: Number,
  highPrice: Number,
  lowPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketSnapshot', snapshotSchema);
