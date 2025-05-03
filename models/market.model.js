const mongoose = require('mongoose');

// ⭐ Market schema
const marketSchema = new mongoose.Schema({
    baseSymbol: { type: String, required: true },    // e.g. BTC
    quoteSymbol: { type: String, required: true },   // e.g. USDT
    lastPrice: { type: Number, default: 0 },
    volume24h: { type: Number, default: 0 },
    change24h: { type: Number, default: 0 },
    high24h: { type: Number, default: 0 },
    low24h: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Market', marketSchema);
