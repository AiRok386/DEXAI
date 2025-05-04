const mongoose = require('mongoose');

// Define the schema for the order book data
const orderBookSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // The trading pair symbol (e.g., BTC-USDT)
  bids: [{
    price: { type: Number, required: true },  // Bid price
    volume: { type: Number, required: true }, // Bid volume
  }],
  asks: [{
    price: { type: Number, required: true },  // Ask price
    volume: { type: Number, required: true }, // Ask volume
  }],
  lastUpdateId: { type: Number, required: true }, // Last update ID from Bitget payload
  timestamp: { type: Date, default: Date.now }, // Time when the data was fetched/updated
}, { timestamps: true });

// Create the model based on the schema
const OrderBook = mongoose.model('OrderBook', orderBookSchema);

module.exports = OrderBook;
