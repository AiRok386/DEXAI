const WebSocket = require('ws');

// Create a reusable store for market data
class MarketDataStore {
  constructor() {
    this.marketData = {}; // Holds live data in memory
    this.expirationTime = 15 * 1000; // 15 seconds expiration time for the data
    this.ws = null;
    this.subscribedSymbols = new Set();
  }

  // Start WebSocket and subscribe to tickers
  start(pairs = []) {
    if (!pairs.length) return;

    // Establish WebSocket connection to Bitget
    this.ws = new WebSocket('wss://ws.bitget.com/v2/ws/public');

    this.ws.on('open', () => {
      // Prepare subscription payload to subscribe to ticker channels for all pairs
      const subscription = {
        op: 'subscribe',
        args: pairs.map((symbol) => ({
          instType: 'SPOT',
          channel: 'ticker',
          instId: symbol,
        })),
      };
      this.ws.send(JSON.stringify(subscription)); // Send the subscription request
      pairs.forEach((s) => this.subscribedSymbols.add(s)); // Add pairs to the subscribed set
      console.log('[Bitget WS] Subscribed to:', pairs);
    });

    this.ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.event === 'error') {
          console.error('[Bitget WS] Error:', msg);
          return;
        }

        // Handle ticker data
        if (msg.arg && msg.arg.channel === 'ticker' && msg.data && msg.data.length) {
          const data = msg.data[0];
          const symbol = data.instId;
          const now = Date.now();

          // Prepare market snapshot
          const marketSnapshot = {
            symbol,
            price: parseFloat(data.lastPr),
            volume: parseFloat(data.baseVolume24h),
            changePercent24Hr: parseFloat(data.change24h),
            timestamp: now,
          };

          // Store the data in memory
          this.set(symbol, marketSnapshot);
        }
      } catch (err) {
        console.error('[Bitget WS] Parse error:', err.message);
      }
    });

    // Handle WebSocket close event
    this.ws.on('close', () => {
      console.log('[Bitget WS] Connection closed.');
      this.subscribedSymbols.clear(); // Clear the subscribed symbols on close
    });

    // Handle WebSocket error event
    this.ws.on('error', (err) => {
      console.error('[Bitget WS] Connection error:', err.message);
    });
  }

  // Set data in memory (with timestamp)
  set(symbol, data) {
    const timestamp = Date.now();
    this.marketData[symbol] = { ...data, timestamp };
  }

  // Get fresh data from memory (if not expired)
  get(symbol) {
    const data = this.marketData[symbol];
    if (!data) return null; // Return null if data is not available

    // Check if data has expired (older than expiration time)
    if (Date.now() - data.timestamp > this.expirationTime) {
      delete this.marketData[symbol]; // Delete expired data
      return null;
    }
    return data;
  }

  // Clear all cached data in memory
  clear() {
    this.marketData = {};
  }

  // Get all cached data (for monitoring or debugging)
  getAll() {
    return this.marketData;
  }
}

// Create and export the single instance of MarketDataStore
const marketDataStore = new MarketDataStore();

// Start WebSocket and subscribe to top symbols (e.g., BTCUSDT, ETHUSDT)
marketDataStore.start([
  'BTCUSDT',
  'ETHUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'SOLUSDT',
  'BNBUSDT',
]);

module.exports = marketDataStore;
