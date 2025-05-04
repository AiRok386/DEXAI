// memory/marketdatastore.js

const WebSocket = require('ws');

// Create a reusable store
class MarketDataStore {
  constructor() {
    this.marketData = {}; // Holds live data in memory
    this.expirationTime = 15 * 1000; // 15 seconds
    this.ws = null;
    this.subscribedSymbols = new Set();
  }

  // Start WebSocket and subscribe to tickers
  start(pairs = []) {
    if (!pairs.length) return;

    this.ws = new WebSocket('wss://ws.bitget.com/v2/ws/public');

    this.ws.on('open', () => {
      const subscription = {
        op: 'subscribe',
        args: pairs.map((symbol) => ({
          instType: 'SPOT',
          channel: 'ticker',
          instId: symbol,
        })),
      };
      this.ws.send(JSON.stringify(subscription));
      pairs.forEach((s) => this.subscribedSymbols.add(s));
      console.log('[Bitget WS] Subscribed to:', pairs);
    });

    this.ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.event === 'error') {
          console.error('[Bitget WS] Error:', msg);
          return;
        }

        if (msg.arg && msg.arg.channel === 'ticker' && msg.data && msg.data.length) {
          const data = msg.data[0];
          const symbol = data.instId;
          const now = Date.now();

          const marketSnapshot = {
            symbol,
            price: parseFloat(data.lastPr),
            volume: parseFloat(data.baseVolume24h),
            changePercent24Hr: parseFloat(data.change24h),
            timestamp: now,
          };

          this.set(symbol, marketSnapshot);
        }
      } catch (err) {
        console.error('[Bitget WS] Parse error:', err.message);
      }
    });

    this.ws.on('close', () => {
      console.log('[Bitget WS] Connection closed.');
      this.subscribedSymbols.clear();
    });

    this.ws.on('error', (err) => {
      console.error('[Bitget WS] Connection error:', err.message);
    });
  }

  // Set data in memory
  set(symbol, data) {
    const timestamp = Date.now();
    this.marketData[symbol] = { ...data, timestamp };
  }

  // Get fresh data
  get(symbol) {
    const data = this.marketData[symbol];
    if (!data) return null;

    if (Date.now() - data.timestamp > this.expirationTime) {
      delete this.marketData[symbol];
      return null;
    }
    return data;
  }

  // Clear all memory cache
  clear() {
    this.marketData = {};
  }

  // Get all cached data
  getAll() {
    return this.marketData;
  }
}

// Create single instance
const marketDataStore = new MarketDataStore();

// Start WebSocket for top symbols (e.g., BTCUSDT, ETHUSDT)
marketDataStore.start([
  'BTCUSDT',
  'ETHUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'SOLUSDT',
  'BNBUSDT',
]);

module.exports = marketDataStore;
