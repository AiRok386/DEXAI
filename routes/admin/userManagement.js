const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const apiKeyAuth = require('../../middlewares/apiKeyAuth');

// ⭐ Admin fetch all users
router.get('/all-users', apiKeyAuth, async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Fetch all users, hide password field
        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Error fetching users." });
    }
});

module.exports = router;
// ⭐ Admin approve user KYC
router.post('/approve-kyc/:userId', apiKeyAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, { kycStatus: 'approved' });
        res.json({ message: "✅ KYC Approved Successfully!" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error approving KYC." });
    }
});

// ⭐ Admin reject user KYC
router.post('/reject-kyc/:userId', apiKeyAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, { kycStatus: 'rejected' });
        res.json({ message: "❌ KYC Rejected." });
    } catch (error) {
        res.status(500).json({ message: "❌ Error rejecting KYC." });
    }
});
// ⭐ Admin ban user
router.post('/ban-user/:userId', apiKeyAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, { accountStatus: 'banned' });
        res.json({ message: "🚫 User Banned Successfully!" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error banning user." });
    }
});

// ⭐ Admin unban user
router.post('/unban-user/:userId', apiKeyAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, { accountStatus: 'active' });
        res.json({ message: "✅ User Unbanned Successfully!" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error unbanning user." });
    }
});
