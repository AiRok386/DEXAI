const mongoose = require('mongoose');

const candleSchema = new mongoose.Schema({
  symbol: String,
  interval: String, // e.g., '1m', '5m', '1h'
  openTime: Number,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
  closeTime: Number,
  createdAt: { type: Date, default: Date.now }
});

candleSchema.index({ symbol: 1, interval: 1, openTime: 1 }, { unique: true });

module.exports = mongoose.model('Candle', candleSchema);
