const mongoose = require('mongoose');

const orderBookSchema = new mongoose.Schema({
  symbol: String,
  bids: [[Number]],  // [price, quantity]
  asks: [[Number]],
  updatedAt: Date
});

module.exports = mongoose.model('OrderBook', orderBookSchema);
