const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    pair: {
        type: String,
        required: true, // Example: "BTC/USDT"
    },
    price: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    side: {
        type: String,
        enum: ['buy', 'sell'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Optional: ref if user-triggered
        default: null,
    },
    isBotTrade: {
        type: Boolean,
        default: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);
