const mongoose = require('mongoose');

// ⭐ Transaction schema
const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    txHash: { type: String }, // Blockchain transaction hash
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    tokenSymbol: { type: String, required: true }, // BTC, ETH, USDT
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    txHash: { type: String }, // Transaction ID (optional)

    note: { type: String } // Admin note if needed
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
