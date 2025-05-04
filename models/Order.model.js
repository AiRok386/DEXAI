// models/Order.model.js

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symbol: { type: String, required: true },
  side: { type: String, enum: ['buy', 'sell'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  filledQuantity: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['open', 'filled', 'cancelled', 'partial'],
    default: 'open',
  },
  type: { type: String, enum: ['limit', 'market'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
