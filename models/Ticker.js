const mongoose = require('mongoose');

const TickerSchema = new mongoose.Schema({
  symbol: { type: String, required: true, uppercase: true, unique: true },
  lastPrice: String,
  open24h: String,
  high24h: String,
  low24h: String,
  priceChangePercent: String,
  baseVolume: String,
  quoteVolume: String,
}, { timestamps: true });

module.exports = mongoose.model('Ticker', TickerSchema);
