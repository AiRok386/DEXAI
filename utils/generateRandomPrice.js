/**
 * Generate a random floating number between min and max with fixed precision
 * @param {Number} min - Minimum price
 * @param {Number} max - Maximum price
 * @param {Number} decimals - Number of decimal places (default 2)
 * @returns {Number}
 */
function generateRandomPrice(min, max, decimals = 2) {
    if (min >= max) throw new Error('Min must be less than max');

    const random = Math.random() * (max - min) + min;
    return parseFloat(random.toFixed(decimals));
}

module.exports = generateRandomPrice;
