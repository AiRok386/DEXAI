// memory/marketdatastore.js

class MarketDataStore {
  constructor() {
    this.marketData = {};  // Holds data in memory
    this.expirationTime = 15 * 1000; // 15 seconds expiration time
  }

  // Set data in memory for a specific trading pair
  set(symbol, data) {
    const timestamp = Date.now();
    this.marketData[symbol] = { ...data, timestamp };
  }

  // Get data from memory if it is still valid
  get(symbol) {
    const data = this.marketData[symbol];

    if (!data) {
      return null; // No data found
    }

    // Check if data is expired (older than 15 seconds)
    if (Date.now() - data.timestamp > this.expirationTime) {
      delete this.marketData[symbol]; // Remove expired data
      return null;
    }

    return data;
  }

  // Clear all market data in memory (optional utility)
  clear() {
    this.marketData = {};
  }

  // Get all stored data
  getAll() {
    return this.marketData;
  }
}

const marketDataStore = new MarketDataStore();

// Export the instance to be used globally
module.exports = marketDataStore;
