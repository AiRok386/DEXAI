const mongoose = require('mongoose');

// ⭐ User schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isFrozen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema); // ⭐ Export model


const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ⭐ Profile Information
    phone:        { type: String },
    address:      { type: String },
    country:      { type: String },
    profileImage: { type: String }, // profile pic (optional)

    // ⭐ KYC Section
    kycStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    kycDocuments: {
        idCardFront: { type: String }, // Front side image URL
        idCardBack:  { type: String }, // Back side image URL
        selfieWithId: { type: String } // Selfie with ID card
    },

    // ⭐ Account Status
    status: {
        type: String,
        enum: ['active', 'frozen'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
