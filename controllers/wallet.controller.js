const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');

// ⭐ Get Wallet Balances
exports.getWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.user.userId });
        res.status(200).json(wallet || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Simulate Deposit
exports.simulateDeposit = async (req, res) => {
    try {
        const { tokenSymbol, amount } = req.body;
        let wallet = await Wallet.findOne({ userId: req.user.userId });

        if (!wallet) {
            wallet = new Wallet({ userId: req.user.userId, balances: [] });
        }

        let token = wallet.balances.find(b => b.tokenSymbol === tokenSymbol);
        if (token) {
            token.balance += amount;
        } else {
            wallet.balances.push({ tokenSymbol, balance: amount });
        }

        await wallet.save();

        // Save transaction record
        const transaction = new Transaction({
            userId: req.user.userId,
            type: 'deposit',
            tokenSymbol,
            amount,
            status: 'completed'
        });
        await transaction.save();

        res.status(200).json({ message: 'Deposit successful', wallet });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Request Withdrawal
exports.requestWithdrawal = async (req, res) => {
    try {
        const { tokenSymbol, amount } = req.body;
        const wallet = await Wallet.findOne({ userId: req.user.userId });

        if (!wallet) return res.status(400).json({ message: 'Wallet not found' });

        let token = wallet.balances.find(b => b.tokenSymbol === tokenSymbol);
        if (!token || token.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct balance immediately (or keep pending)
        token.balance -= amount;
        await wallet.save();

        const transaction = new Transaction({
            userId: req.user.userId,
            type: 'withdrawal',
            tokenSymbol,
            amount,
            status: 'pending'
        });
        await transaction.save();

        res.status(200).json({ message: 'Withdrawal requested, pending admin approval' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Admin Approve/Deny Withdrawal
exports.adminProcessWithdrawal = async (req, res) => {
    try {
        const { transactionId, action } = req.body;
        const transaction = await Transaction.findById(transactionId);

        if (!transaction || transaction.type !== 'withdrawal') {
            return res.status(400).json({ message: 'Invalid transaction' });
        }

        if (action === 'approve') {
            transaction.status = 'completed';
        } else if (action === 'deny') {
            transaction.status = 'failed';

            // Refund the amount back
            const wallet = await Wallet.findOne({ userId: transaction.userId });
            let token = wallet.balances.find(b => b.tokenSymbol === transaction.tokenSymbol);
            if (token) {
                token.balance += transaction.amount;
                await wallet.save();
            }
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await transaction.save();
        res.status(200).json({ message: 'Withdrawal ' + action + 'd successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
