const mongoose = require('mongoose');

// Trade Schema
const TradeSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      index: true,  // Index the symbol for faster queries
      uppercase: true,  // Ensure the symbol is stored in uppercase
      trim: true,
    },
    price: {
      type: String, // The price is stored as a string (received from Bitget)
      required: true,
    },
    quantity: {
      type: String, // The quantity is stored as a string (received from Bitget)
      required: true,
    },
    side: {
      type: String, // 'buy' or 'sell'
      required: true,
      enum: ['buy', 'sell'], // Only allow 'buy' or 'sell' values
    },
    tradeId: {
      type: String,
      required: true,
      unique: true, // Ensure tradeId is unique to avoid duplicate records
    },
    timestamp: {
      type: Date,
      required: true, // The timestamp when the trade happened
    },
    source: {
      type: String,
      default: 'Bitget', // Source is Bitget by default
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Optional: Set TTL (Time To Live) for trades. Auto-delete after 24 hours (86400s).
TradeSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Trade', TradeSchema);
