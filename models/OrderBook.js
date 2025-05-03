const mongoose = require('mongoose');

const orderBookSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  bids: [
    [String], // [price, quantity]
  ],
  asks: [
    [String], // [price, quantity]
  ],
  lastUpdateId: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OrderBook', orderBookSchema);
