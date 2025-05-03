// models/tradefeed.js

const mongoose = require('mongoose');

// Define the TradeFeed schema
const TradeFeedSchema = new mongoose.Schema({
  tradeId: {
    type: String,
    required: true,
    unique: true,  // Ensure each trade has a unique identifier
  },
  symbol: {
    type: String,
    required: true,  // The trading pair (e.g., BTCUSDT, ETHUSDT)
  },
  price: {
    type: Number,
    required: true,  // The price at which the trade occurred
  },
  volume: {
    type: Number,
    required: true,  // The volume of the trade
  },
  timestamp: {
    type: Date,
    default: Date.now,  // Timestamp of when the trade occurred
  },
  isBuy: {
    type: Boolean,
    required: true,  // Whether it's a buy (true) or sell (false) trade
  },
  isMaker: {
    type: Boolean,
    required: true,  // Whether it's a maker trade (true) or taker trade (false)
  },
});

// Create the model using the schema
const TradeFeed = mongoose.model('TradeFeed', TradeFeedSchema);

// Export the model for use in other parts of the application
module.exports = TradeFeed;
