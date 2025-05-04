const WebSocket = require('ws');
const marketDataStore = require('../memory/marketdatastore');

// Bitget WebSocket URL for the Spot API
const BITGET_WS_URL = 'wss://ws.bitget.com/spot/v1/stream';

// WebSocket instance
let ws = null;

// Function to connect to Bitget WebSocket and subscribe to channels
function connectWebSocket() {
  ws = new WebSocket(BITGET_WS_URL);

  ws.on('open', () => {
    console.log('🌐 WebSocket connection established with Bitget');
    // Subscribe to required channels (OrderBook, Trades, and Klines)
    subscribeToMarketData();
  });

  ws.on('message', (data) => {
    handleIncomingData(JSON.parse(data));
  });

  ws.on('close', () => {
    console.log('⚠️ WebSocket connection closed. Reconnecting...');
    // Reconnect if connection is lost
    setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
}

// Function to subscribe to the required WebSocket channels
function subscribeToMarketData() {
  // Subscribe to market channels (OrderBook, Trades, and Klines)
  ws.send(
    JSON.stringify({
      op: 'subscribe',
      args: [
        {
          channel: 'orderbook',
          instId: 'BTC-USDT' // You can change the symbol here
        },
        {
          channel: 'trade',
          instId: 'BTC-USDT'
        },
        {
          channel: 'candle1m',
          instId: 'BTC-USDT'
        }
      ]
    })
  );
}

// Function to handle incoming WebSocket messages
function handleIncomingData(data) {
  if (data.arg && data.arg.channel) {
    const { channel, instId } = data.arg;

    if (channel === 'orderbook') {
      // Process order book data
      const orderBook = {
        symbol: instId,
        bids: data.data.bids,
        asks: data.data.asks
      };
      marketDataStore.set(instId, orderBook); // Store in memory
    }

    if (channel === 'trade') {
      // Process trade data
      const trades = data.data.map((trade) => ({
        price: trade.p,
        quantity: trade.a,
        timestamp: new Date(trade.t)
      }));
      marketDataStore.set(instId, { symbol: instId, trades });
    }

    if (channel === 'candle1m') {
      // Process kline data (1-minute candles)
      const klines = data.data.map((candle) => ({
        openTime: new Date(candle.ts),
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
        volume: candle.v
      }));
      marketDataStore.set(instId, { symbol: instId, klines });
    }
  }
}

// Function to fetch Order Book from WebSocket
function getOrderBookFromWebSocket(symbol) {
  const data = marketDataStore.get(symbol);

  if (!data || !data.bids || !data.asks) {
    return null; // If data is not available or expired
  }

  return {
    bids: data.bids,
    asks: data.asks
  };
}

// Function to fetch Trades from WebSocket
function getTradesFromWebSocket(symbol) {
  const data = marketDataStore.get(symbol);

  if (!data || !data.trades) {
    return null; // If data is not available or expired
  }

  return data.trades;
}

// Function to fetch Klines (candlesticks) from WebSocket
function getKlinesFromWebSocket(symbol, interval) {
  const data = marketDataStore.get(symbol);

  if (!data || !data.klines) {
    return null; // If data is not available or expired
  }

  return data.klines;
}

// Start WebSocket connection when the app starts
connectWebSocket();

module.exports = {
  getOrderBookFromWebSocket,
  getTradesFromWebSocket,
  getKlinesFromWebSocket
};
