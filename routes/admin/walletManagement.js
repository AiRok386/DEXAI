const express = require('express');
const router = express.Router();
const Wallet = require('../../models/Wallet');
const apiKeyAuth = require('../../middlewares/apiKeyAuth');

// ⭐ Admin view user wallet balances
router.get('/user-wallet/:userId', apiKeyAuth, async (req, res) => {
    try {
        const wallets = await Wallet.find({ userId: req.params.userId });
        res.json({ wallets });
    } catch (error) {
        res.status(500).json({ message: "❌ Error fetching wallet balances." });
    }
});

module.exports = router;
// ⭐ Admin freeze user's wallet
router.post('/freeze-wallet/:walletId', apiKeyAuth, async (req, res) => {
    try {
        await Wallet.findByIdAndUpdate(req.params.walletId, { status: 'frozen' });
        res.json({ message: "🚫 Wallet Frozen!" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error freezing wallet." });
    }
});

// ⭐ Admin unfreeze user's wallet
router.post('/unfreeze-wallet/:walletId', apiKeyAuth, async (req, res) => {
    try {
        await Wallet.findByIdAndUpdate(req.params.walletId, { status: 'active' });
        res.json({ message: "✅ Wallet Unfrozen!" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error unfreezing wallet." });
    }
});
// ⭐ Admin force withdrawal (adjust balance manually)
router.post('/adjust-balance/:walletId', apiKeyAuth, async (req, res) => {
    const { amount } = req.body;
    try {
        const wallet = await Wallet.findById(req.params.walletId);
        if (!wallet) {
            return res.status(404).json({ message: "❌ Wallet not found." });
        }

        wallet.balance += amount; // ➡️ If amount negative, it reduces
        await wallet.save();

        res.json({ message: "✅ Wallet balance adjusted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error adjusting balance." });
    }
});
