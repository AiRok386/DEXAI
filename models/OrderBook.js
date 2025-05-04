const mongoose = require('mongoose');

// Define the schema for the order book data
const orderBookSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // The trading pair symbol (e.g., BTC-USDT)
  bidLevels: [{
    price: { type: Number, required: true },  // Bid price
    volume: { type: Number, required: true }, // Bid volume
  }],
  askLevels: [{
    price: { type: Number, required: true },  // Ask price
    volume: { type: Number, required: true }, // Ask volume
  }],
  timestamp: { type: Date, default: Date.now }, // Time when the data was fetched/updated
});

// Create the model based on the schema
const OrderBook = mongoose.model('OrderBook', orderBookSchema);

module.exports = OrderBook;
