// utils/parseHelpers.js

/**
 * Parse and format the incoming trade data from Bitget WebSocket.
 * @param {Object} tradeData - The raw trade data from Bitget WebSocket.
 * @returns {Object} - The formatted trade data to store in the database.
 */
function parseTradeData(tradeData) {
  return {
    symbol: tradeData.symbol?.toUpperCase(),
    price: parseFloat(tradeData.price),
    quantity: parseFloat(tradeData.size),
    time: new Date(tradeData.timestamp),
    isBuy: tradeData.side === 'buy',
  };
}

/**
 * Parse and format the incoming order book data from Bitget WebSocket.
 * @param {Object} orderBookData - The raw order book data from Bitget WebSocket.
 * @returns {Object} - The formatted order book data to store in the database.
 */
function parseOrderBookData(orderBookData) {
  return {
    symbol: orderBookData.symbol?.toUpperCase(),
    bids: orderBookData.bids.map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    })),
    asks: orderBookData.asks.map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    })),
    time: new Date(orderBookData.timestamp),
  };
}

/**
 * Converts interval string to milliseconds.
 * Supports 'm', 'h', 'd' formats like '1m', '5m', '1h', '1d'
 */
function getIntervalMs(interval) {
  const num = parseInt(interval);
  if (interval.endsWith('m')) return num * 60 * 1000;
  if (interval.endsWith('h')) return num * 60 * 60 * 1000;
  if (interval.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  return 60 * 1000; // Default to 1m
}

/**
 * Parse and format the incoming kline (candlestick) message from Bitget WebSocket.
 * @param {Object} parsed - Parsed kline message with arg and data fields.
 * @returns {Object} - The formatted kline document to store in the database.
 */
function parseKlineMessage(parsed) {
  const { arg, data } = parsed;
  const [timestamp, open, high, low, close, volume, quoteVolume] = data;
  const interval = arg.instId.split('.')[0].split('candle')[1];
  const symbol = arg.instId.split('.')[1];

  return {
    symbol: symbol.toUpperCase(),
    interval,
    open: open,
    high: high,
    low: low,
    close: close,
    volume: volume,
    openTime: new Date(Number(timestamp)),
    closeTime: new Date(Number(timestamp) + getIntervalMs(interval)),
    tradeCount: 0, // Not provided by Bitget
    isFinal: true,
    symbolInterval: `${symbol}_${interval}`,
    source: 'Bitget',
  };
}

/**
 * Parse and format the incoming 24h market ticker data from Bitget WebSocket.
 * @param {Object} marketData - Raw 24h ticker data.
 * @returns {Object} - Formatted 24h data object.
 */
function parseMarketData(marketData) {
  return {
    symbol: marketData.symbol?.toUpperCase(),
    priceChange: parseFloat(marketData.priceChange),
    priceChangePercent: parseFloat(marketData.priceChangePercent),
    highPrice: parseFloat(marketData.highPrice),
    lowPrice: parseFloat(marketData.lowPrice),
    volume: parseFloat(marketData.volume),
    openPrice: parseFloat(marketData.openPrice),
  };
}

module.exports = {
  parseTradeData,
  parseOrderBookData,
  parseKlineMessage,
  parseMarketData,
  getIntervalMs,
};
