const mongoose = require('mongoose');

const marketSnapshotSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  price: Number,
  volume: Number,
  priceChangePercent: Number,
  highPrice: Number,
  lowPrice: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.MarketSnapshot || mongoose.model('MarketSnapshot', marketSnapshotSchema);
