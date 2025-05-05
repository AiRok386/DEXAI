const mongoose = require('mongoose');

// Ticker Schema to store real-time market data from Bitget WebSocket
const TickerSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    lastPrice: {
      type: Number,
      required: true,
    },
    open24h: {
      type: Number,
      required: false,
    },
    high24h: {
      type: Number,
      required: false,
    },
    low24h: {
      type: Number,
      required: false,
    },
    priceChangePercent: {
      type: Number, // 24h percentage change
      required: false,
    },
    baseVolume: {
      type: Number,
      required: false,
    },
    quoteVolume: {
      type: Number,
      required: false,
    },
    bestBid: {
      type: Number,
      required: false,
    },
    bestAsk: {
      type: Number,
      required: false,
    },
    source: {
      type: String,
      default: 'Bitget',
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Optional: Auto-remove outdated tickers after 24 hours
// TickerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Ticker', TickerSchema);
