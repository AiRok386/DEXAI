const mongoose = require('mongoose');

const icoPurchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who bought
    icoId: { type: mongoose.Schema.Types.ObjectId, ref: 'ICO', required: true }, // ICO project
    amountUSD: { type: Number, required: true }, // How much USD invested
    tokensBought: { type: Number, required: true }, // How many tokens bought
    status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' }, // Payment status
}, { timestamps: true });

module.exports = mongoose.model('ICOPurchase', icoPurchaseSchema);
