const marketData = {};

function updateMarketData(symbol, data) {
  marketData[symbol] = { ...data, updatedAt: new Date() };
}

function getMarketData(symbol) {
  return marketData[symbol] || null;
}

function getAllMarketData() {
  return marketData;
}

module.exports = { updateMarketData, getMarketData, getAllMarketData };
