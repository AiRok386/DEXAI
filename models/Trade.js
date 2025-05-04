const mongoose = require('mongoose');

// Define the schema for the trade data
const tradeSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // The trading pair symbol (e.g., BTC-USDT)
  tradeId: { type: String, required: true, unique: true }, // Unique trade ID
  price: { type: Number, required: true }, // The price at which the trade was executed
  volume: { type: Number, required: true }, // The volume of the trade
  side: { type: String, enum: ['buy', 'sell'], required: true }, // Whether the trade was a buy or sell
  timestamp: { type: Date, default: Date.now }, // Time when the trade occurred
});

// Create the model based on the schema
const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
