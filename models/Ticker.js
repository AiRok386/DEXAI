const mongoose = require('mongoose');

// Ticker Schema to store the latest price and volume for each trading pair
const TickerSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      index: true, // Index the symbol for faster querying
      uppercase: true, // Ensure the symbol is stored in uppercase
      trim: true,
      unique: true, // Ensure symbol is unique
    },
    lastPrice: {
      type: String, // The latest price (received as a string from Bitget)
      required: true,
    },
    volume: {
      type: String, // The total volume traded in the last 24 hours (received as a string)
      required: true,
    },
    change24h: {
      type: String, // The 24h price change (percentage, received as a string)
      required: true,
    },
    high24h: {
      type: String, // The highest price in the last 24 hours (received as a string)
      required: true,
    },
    low24h: {
      type: String, // The lowest price in the last 24 hours (received as a string)
      required: true,
    },
    source: {
      type: String,
      default: 'Bitget', // Source is Bitget by default
      trim: true,
    },
    open24h: {
      type: String, // The opening price for the last 24 hours
      required: true,
    },
    baseVolume: {
      type: String, // The base currency volume in the last 24 hours
      required: true,
    },
    quoteVolume: {
      type: String, // The quote currency volume in the last 24 hours
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Optional: Set TTL (Time To Live) for ticker data. Auto-delete after 24 hours (86400s).
TickerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Ticker', TickerSchema);
