// crypto.util.js

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hash a plain password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

/**
 * Compare a plain password with a hashed password
 * @param {string} inputPassword - Password user entered
 * @param {string} storedHash - Password hash from DB
 * @returns {Promise<boolean>} - Password match status
 */
async function verifyPassword(inputPassword, storedHash) {
    return bcrypt.compare(inputPassword, storedHash);
}

/**
 * Generate a random hex token (e.g., for email/2FA/API keys)
 * @param {number} length - Token length in bytes (default 32)
 * @returns {string} - Hexadecimal token
 */
function generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash any token (e.g. for storing hashed email token in DB)
 * @param {string} token - Original token
 * @returns {string} - Hashed token using SHA256
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    hashToken,
};
