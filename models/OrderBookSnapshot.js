const mongoose = require('mongoose');

const orderBookSchema = new mongoose.Schema({
  symbol: String,
  bids: [[String]], // [ [price, quantity], ... ]
  asks: [[String]],
  lastUpdateId: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OrderBookSnapshot', orderBookSchema);
