// utils/tokenList.js

const fs = require('fs');
const path = require('path');

// Reads tokens.json and returns active token symbols
function getActiveTokens() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../config/tokens.json'));
    const tokens = JSON.parse(data);
    return tokens.filter(t => t.active).map(t => t.symbol);
  } catch (err) {
    console.error('❌ Failed to load tokens.json:', err.message);
    return [];
  }
}

module.exports = { getActiveTokens };
