const User = require('../models/user.model');

// ⭐ Fetch User Info
const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Update Profile
const updateProfile = async (req, res) => {
    try {
        const { phone, address, country } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { phone, address, country },
            { new: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Submit KYC
const submitKyc = async (req, res) => {
    try {
        const { idCardFront, idCardBack, selfieWithId } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {
                kycDocuments: { idCardFront, idCardBack, selfieWithId },
                kycStatus: 'pending'
            },
            { new: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Admin: Approve or Reject KYC
const adminKycAction = async (req, res) => {
    try {
        const { userId, action } = req.body;

        if (!['approved', 'rejected'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { kycStatus: action },
            { new: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Properly Export All Functions
module.exports = {
    getUserInfo,
    updateProfile,
    submitKyc,
    adminKycAction
};
