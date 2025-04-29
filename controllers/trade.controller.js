const Wallet = require('../models/wallet.model');
const Order = require('../models/Order.model');
const mongoose = require('mongoose');

// ⭐ Place Order (Buy/Sell)
exports.placeOrder = async (req, res) => {
    try {
        const { type, orderType, tokenSymbol, price, amount } = req.body;

        if (!type || !orderType || !tokenSymbol || !amount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (orderType === 'limit' && !price) {
            return res.status(400).json({ message: 'Price required for limit order' });
        }

        const newOrder = new Order({
            userId: req.user.userId,
            type,
            orderType,
            tokenSymbol,
            price,
            amount
        });

        await newOrder.save();

        res.status(200).json({ message: 'Order placed', order: newOrder });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Fetch Order Book
exports.getOrderBook = async (req, res) => {
    try {
        const { tokenSymbol } = req.query;

        const buyOrders = await Order.find({ tokenSymbol, type: 'buy', status: 'open' }).sort({ price: -1 });
        const sellOrders = await Order.find({ tokenSymbol, type: 'sell', status: 'open' }).sort({ price: 1 });

        res.status(200).json({ buyOrders, sellOrders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Matching Engine (Simple Basic Version)
exports.matchOrders = async (tokenSymbol) => {
    try {
        const buyOrders = await Order.find({ tokenSymbol, type: 'buy', status: 'open' }).sort({ price: -1, createdAt: 1 });
        const sellOrders = await Order.find({ tokenSymbol, type: 'sell', status: 'open' }).sort({ price: 1, createdAt: 1 });

        for (let buyOrder of buyOrders) {
            for (let sellOrder of sellOrders) {
                if (buyOrder.price >= sellOrder.price) {
                    // Find how much can be matched
                    const matchAmount = Math.min(buyOrder.amount - buyOrder.filledAmount, sellOrder.amount - sellOrder.filledAmount);

                    if (matchAmount <= 0) continue;

                    // Update orders
                    buyOrder.filledAmount += matchAmount;
                    sellOrder.filledAmount += matchAmount;

                    // Update status
                    if (buyOrder.filledAmount === buyOrder.amount) buyOrder.status = 'filled';
                    else buyOrder.status = 'partial';

                    if (sellOrder.filledAmount === sellOrder.amount) sellOrder.status = 'filled';
                    else sellOrder.status = 'partial';

                    // Save orders
                    await buyOrder.save();
                    await sellOrder.save();

                    // TODO: Update user wallets here (credit tokens after match)
                }
            }
        }
    } catch (error) {
        console.error('Matching Engine Error:', error.message);
    }
};
