const mongoose = require('mongoose');

// Kline (Candlestick) Schema
const KlineSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      index: true, // Index the symbol for faster queries
      uppercase: true, // Ensure the symbol is stored in uppercase
      trim: true,
    },
    openTime: {
      type: Date,
      required: true, // The timestamp for when the Kline period starts
    },
    open: {
      type: String, // The open price (received as a string)
      required: true,
    },
    high: {
      type: String, // The high price during the Kline period
      required: true,
    },
    low: {
      type: String, // The low price during the Kline period
      required: true,
    },
    close: {
      type: String, // The close price at the end of the Kline period
      required: true,
    },
    volume: {
      type: String, // The total volume during the Kline period
      required: true,
    },
    closeTime: {
      type: Date,
      required: true, // The timestamp for when the Kline period ends
    },
    symbolInterval: {
      type: String,
      required: true, // The interval (e.g., '1m', '5m', '1h')
    },
    source: {
      type: String,
      default: 'Bitget', // Source is Bitget by default
      trim: true,
    },
    tradeCount: {
      type: Number, // The number of trades during the Kline period
      required: true,
    },
    isFinal: {
      type: Boolean, // Whether the Kline is final (closed)
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Optional: Set TTL (Time To Live) for Kline data. Auto-delete after 24 hours (86400s).
KlineSchema.index({ openTime: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Kline', KlineSchema);
