const mongoose = require('mongoose');



const tokenSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Full name (e.g., Bitcoin)
    symbol: { type: String, required: true }, // Symbol (e.g., BTC)
    iconUrl: { type: String }, // Logo URL
    contractAddress: { type: String }, // Optional: for ERC20/BEP20 tokens
    decimals: { type: Number, default: 18 }, // Token decimals
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Show or hide in frontend
    pairWith: { type: String, default: 'USDT' }, // Trading pair
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);

