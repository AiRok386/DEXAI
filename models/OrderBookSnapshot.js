const mongoose = require('mongoose');

// OrderBookSnapshot Schema
const OrderBookSnapshotSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      index: true,  // Index the symbol for fast queries
      uppercase: true,  // Ensure symbol is stored in uppercase
      trim: true,
    },
    bids: {
      type: [[Number]], // Format: [[price, quantity], ...]
      validate: {
        validator: function (arr) {
          return arr.every(pair => pair.length === 2 && pair.every(Number.isFinite));
        },
        message: 'Invalid bid format. Must be an array of [price, quantity] pairs.',
      },
      required: true,
    },
    asks: {
      type: [[Number]], // Format: [[price, quantity], ...]
      validate: {
        validator: function (arr) {
          return arr.every(pair => pair.length === 2 && pair.every(Number.isFinite));
        },
        message: 'Invalid ask format. Must be an array of [price, quantity] pairs.',
      },
      required: true,
    },
    source: {
      type: String,
      default: 'Bitget',  // Default source is Bitget
      trim: true,
    },
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt fields
  }
);

// Optional: Set TTL (Time To Live) for snapshots. Automatically deletes after 10 minutes.
OrderBookSnapshotSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('OrderBookSnapshot', OrderBookSnapshotSchema);
