const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  symbol: String,
  name: String,
  price: Number,
  volume: Number,
  changePercent24Hr: Number,
  updatedAt: Date
});

module.exports = mongoose.model('Price', priceSchema);
