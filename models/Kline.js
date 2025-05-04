const mongoose = require('mongoose');

// Define the schema for the candlestick (Kline) data
const klineSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // The trading pair symbol (e.g., BTC-USDT)
  openTime: { type: Date, required: true }, // The start time of the candlestick
  open: { type: Number, required: true }, // Opening price of the candlestick
  high: { type: Number, required: true }, // Highest price during the candlestick period
  low: { type: Number, required: true }, // Lowest price during the candlestick period
  close: { type: Number, required: true }, // Closing price of the candlestick
  volume: { type: Number, required: true }, // Trading volume during the candlestick period
  closeTime: { type: Date, required: true }, // The end time of the candlestick
  interval: { type: String, required: true }, // The time interval (e.g., '1m', '5m', '1h')
  tradeCount: { type: Number, required: true }, // The number of trades during the candlestick
  isFinal: { type: Boolean, default: false }, // Whether the candlestick is final (closed)
});

// Create the model based on the schema
const Kline = mongoose.model('Kline', klineSchema);

module.exports = Kline;
