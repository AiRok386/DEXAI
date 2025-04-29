const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  symbol: String,
  price: Number,
  qty: Number,
  timestamp: Number,
  isBuyerMaker: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);
