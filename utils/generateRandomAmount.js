/**
 * Generate a random trade amount between min and max with fixed precision
 * @param {Number} min - Minimum trade amount
 * @param {Number} max - Maximum trade amount
 * @param {Number} decimals - Number of decimal places (default: 4)
 * @returns {Number}
 */
function generateRandomAmount(min, max, decimals = 4) {
    if (min >= max) throw new Error('Min must be less than max');

    const random = Math.random() * (max - min) + min;
    return parseFloat(random.toFixed(decimals));
}

module.exports = generateRandomAmount;
