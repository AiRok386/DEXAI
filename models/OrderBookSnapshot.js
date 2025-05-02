const mongoose = require('mongoose');

const OrderBookSnapshotSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true,
    uppercase: true,
    trim: true,
  },
  bids: {
    type: [[Number]], // Format: [[price, quantity], ...]
    validate: {
      validator: function (arr) {
        return arr.every(pair => pair.length === 2 && pair.every(Number.isFinite));
      },
      message: 'Invalid bid format. Must be an array of [price, quantity] pairs.'
    },
    required: true,
  },
  asks: {
    type: [[Number]], // Format: [[price, quantity], ...]
    validate: {
      validator: function (arr) {
        return arr.every(pair => pair.length === 2 && pair.every(Number.isFinite));
      },
      message: 'Invalid ask format. Must be an array of [price, quantity] pairs.'
    },
    required: true,
  },
  source: {
    type: String,
    default: 'CoinCap',
    trim: true,
  },
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Optional: Create TTL index to auto-delete old snapshots after X time (e.g., 10 mins)
OrderBookSnapshotSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('OrderBookSnapshot', OrderBookSnapshotSchema);
