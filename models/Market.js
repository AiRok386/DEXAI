const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true // CoinCap asset ID like "bitcoin", "ethereum"
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  priceUsd: {
    type: Number,
    required: true
  },
  volumeUsd24Hr: {
    type: Number,
    required: false
  },
  changePercent24Hr: {
    type: Number,
    required: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

marketSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Market', marketSchema);
