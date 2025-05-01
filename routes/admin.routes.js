const express = require('express');
const router = express.Router();

const { protectAdmin } = require('../middlewares/admin.middleware');
const User = require('../models/user.model');

// ⭐ GET all users (admin dashboard)
router.get('/users', protectAdmin, async (req, res, next) => {
    try {
        const users = await User.find().select('-password'); // hide password
        res.json({ success: true, users });
    } catch (err) {
        next(err);
    }
});

// ⭐ PUT update KYC status
router.put('/users/:id/kyc', protectAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            res.status(400);
            throw new Error('Invalid KYC status');
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { kycStatus: status },
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
});

// ⭐ PATCH freeze/unfreeze user account
router.patch('/users/:id/freeze', protectAdmin, async (req, res, next) => {
    try {
        const { action } = req.body;
        if (!['freeze', 'unfreeze'].includes(action)) {
            res.status(400);
            throw new Error('Invalid action');
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: action === 'freeze' ? 'frozen' : 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.json({ success: true, message: `User ${action}d successfully`, user });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
