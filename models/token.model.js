// models/token.model.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  iconUrl: { type: String },
  contractAddress: { type: String },
  decimals: { type: Number, default: 18 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  pairWith: { type: String, default: 'USDT' },
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);
