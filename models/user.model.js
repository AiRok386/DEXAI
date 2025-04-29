const mongoose = require('mongoose');

// ⭐ User Schema Definition
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ⭐ Optional Profile Info
    phone:        { type: String },
    address:      { type: String },
    country:      { type: String },
    profileImage: { type: String }, // URL to profile pic

    // ⭐ KYC Info
    kycStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    kycDocuments: {
        idCardFront:  { type: String },
        idCardBack:   { type: String },
        selfieWithId: { type: String }
    },

    // ⭐ Account Status
    status: {
        type: String,
        enum: ['active', 'frozen'],
        default: 'active'
    }
}, { timestamps: true });

// ✅ Safe export: prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
