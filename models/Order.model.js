const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  orderType: { type: String, enum: ['limit', 'market'], required: true },
  tokenSymbol: { type: String, required: true },
  pair: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  filledAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'filled', 'cancelled', 'partial'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
