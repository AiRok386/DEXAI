const mongoose = require('mongoose');

// ⭐ ICO schema
const icoSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    description: { type: String }, // Brief about the project
    tokenSymbol: { type: String, required: true },
    totalSupply: { type: Number, required: true },
    pricePerToken: { type: Number, required: true },
    minPurchase: { type: Number, default: 10 }, // Minimum purchase amount
    maxPurchase: { type: Number, default: 10000 }, // Maximum purchase amount
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' }, // Status of sale
}, { timestamps: true });

module.exports = mongoose.model('ICO', icoSchema);
