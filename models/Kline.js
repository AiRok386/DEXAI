// models/Kline.js

const mongoose = require('mongoose');

// Kline (Candlestick) Schema for Bitget WebSocket
const KlineSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    interval: {
      type: String, // E.g., '1m', '5m', '1h'
      required: true,
    },
    openTime: {
      type: Date, // Start of candle
      required: true,
    },
    closeTime: {
      type: Date, // End of candle
      required: true,
    },
    open: {
      type: String,
      required: true,
    },
    high: {
      type: String,
      required: true,
    },
    low: {
      type: String,
      required: true,
    },
    close: {
      type: String,
      required: true,
    },
    volume: {
      type: String,
      required: true,
    },
    tradeCount: {
      type: Number, // Number of trades during this candle
      required: true,
    },
    isFinal: {
      type: Boolean,
      default: false, // Whether the kline is final/closed
    },
    symbolInterval: {
      type: String,
      required: true, // e.g., 'BTCUSDT-1m'
    },
    source: {
      type: String,
      default: 'Bitget',
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Prevent duplicates for the same candle
KlineSchema.index({ symbol: 1, interval: 1, openTime: 1 }, { unique: true });

// Optional: Auto-delete after 24h (adjustable)
KlineSchema.index({ openTime: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Kline', KlineSchema);
