const mongoose = require('mongoose');

// ⭐ Transaction schema
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    tokenSymbol: { type: String, required: true }, // BTC, ETH, USDT
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    txHash: { type: String }, // Blockchain transaction hash
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    note: { type: String } // Admin note if needed
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
