const mongoose = require('mongoose');

// ⭐ Order schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Linked to user
    type: { type: String, enum: ['buy', 'sell'], required: true }, // Buy or Sell
    orderType: { type: String, enum: ['limit', 'market'], required: true }, // Limit or Market
    tokenSymbol: { type: String, required: true }, // Trading pair like BTC/USDT
    pair: { type: String, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true }, // How much token user wants to buy/sell
    createdAt: { type: Date, default: Date.now },
    filledAmount: { type: Number, default: 0 }, // How much already filled

    status: { type: String, enum: ['open', 'filled', 'cancelled', 'partial'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
