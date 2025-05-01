const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    tradingPair: {
        type: String,
        required: true, // Example: "BTC/USDT"
    },
    side: {
        type: String,
        enum: ['buy', 'sell'],
        required: true,
    },
    minPrice: {
        type: Number,
        required: true,
    },
    maxPrice: {
        type: Number,
        required: true,
    },
    minAmount: {
        type: Number,
        required: true,
    },
    maxAmount: {
        type: Number,
        required: true,
    },
    interval: {
        type: Number,
        required: true, // in milliseconds
        default: 5000
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who created the bot
        required: true
    },
    lastExecutedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Bot', botSchema);
