const mongoose = require('mongoose');

// ⭐ ICO schema
const ICOSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    totalSupply: { type: Number, required: true },
    pricePerToken: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' }
});

module.exports = mongoose.model('ICO', ICOSchema);
const mongoose = require('mongoose');

const icoSchema = new mongoose.Schema({
    projectName: { type: String, required: true }, // Name of the ICO project
    description: { type: String }, // Brief about the project
    tokenSymbol: { type: String, required: true }, // Token symbol (e.g., XYZ)
    totalSupply: { type: Number, required: true }, // Total supply offered in ICO
    pricePerToken: { type: Number, required: true }, // Sale price per token (USD)
    minPurchase: { type: Number, default: 10 }, // Minimum purchase amount
    maxPurchase: { type: Number, default: 10000 }, // Maximum purchase amount
    startDate: { type: Date, required: true }, // ICO start date
    endDate: { type: Date, required: true }, // ICO end date
    status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' }, // Status of sale
}, { timestamps: true });

module.exports = mongoose.model('ICO', icoSchema);
