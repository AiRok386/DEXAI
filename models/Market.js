// models/Market.js

const mongoose = require('mongoose');

// Define the schema for market data (order book + price stats)
const MarketSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },

  // Market price and statistics
  lastPrice: { type: Number, required: true },  // Last traded price
  high24h: { type: Number, required: true },    // High price in the last 24 hours
  low24h: { type: Number, required: true },     // Low price in the last 24 hours
  change24h: { type: Number, required: true },  // 24h change in price
  volume24h: { type: Number, required: true },  // 24h trading volume
  priceChangePercent: { type: Number },         // 24h price change in percentage
  highPrice: { type: Number },                  // High price during the current session
  lowPrice: { type: Number },                   // Low price during the current session
  
  // Order book data (bids/asks)
  orderBook: {
    bids: [{ price: Number, quantity: Number }], // Top 10 bids
    asks: [{ price: Number, quantity: Number }], // Top 10 asks
  },

  timestamp: { type: Date, default: Date.now }   // Timestamp for when the data was saved/updated
});

// Export the Market model to be used in other parts of the application
module.exports = mongoose.model('Market', MarketSchema);
