const mongoose = require('mongoose');

// ⭐ Market schema
const marketSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true }, // e.g. BTCUSDT
  price: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  change24h: { type: Number, default: 0 },
  high24h: { type: Number, default: 0 },
  low24h: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Market', marketSchema);
