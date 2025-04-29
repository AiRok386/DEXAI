const mongoose = require('mongoose');

// ⭐ Wallet schema
const walletschema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: String, required: true },
    balance: { type: Number, default: 0 },
    address: { type: String }
});



const walletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User reference

    // ⭐ For each token/coin
    balances: [{
        tokenSymbol: { type: String, required: true }, // like BTC, ETH, USDT
        balance: { type: Number, default: 0 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
