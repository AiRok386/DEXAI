// cache/marketCache.js

const marketCache = {};

function updateMarket(symbol, data) {
  marketCache[symbol] = data;
}

function getMarketCache() {
  return marketCache;
}

module.exports = { updateMarket, getMarketCache };
