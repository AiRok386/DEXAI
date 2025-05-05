// utils/parseHelpers.js

/**
 * Parse and format the incoming trade data from Bitget WebSocket.
 * @param {Array} data - The trade data array from Bitget WebSocket.
 * @returns {Object} - The formatted trade data.
 */
function parseTradeData(data) {
  const trade = data[0]; // Bitget sends an array of trades
  return {
    symbol: trade.instId,
    price: parseFloat(trade.px),
    quantity: parseFloat(trade.sz),
    time: new Date(Number(trade.ts)),
    isBuy: trade.side === 'buy',
  };
}

/**
 * Parse and format the incoming order book data from Bitget WebSocket.
 * @param {Object} data - The order book snapshot from Bitget.
 * @returns {Object} - Formatted order book object.
 */
function parseOrderBookData(data) {
  return {
    symbol: data.instId,
    bids: data.bids.slice(0, 10).map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    })),
    asks: data.asks.slice(0, 10).map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    })),
    time: new Date(Number(data.ts)),
  };
}

/**
 * Parse and format the incoming kline (candlestick) message from Bitget WebSocket.
 * @param {Object} parsed - Parsed kline message from Bitget.
 * @returns {Object} - The formatted kline object.
 */
function parseKlineMessage(parsed) {
  const { arg, data } = parsed;
  const [
    openTime,
    open,
    high,
    low,
    close,
    volume,
    quoteVolume
  ] = data[0];

  const symbol = arg.instId;
  const interval = arg.channel.replace('candle', '');

  return {
    symbol: symbol,
    interval: interval,
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
    openTime: new Date(Number(openTime)),
    closeTime: new Date(Number(openTime) + getIntervalMs(interval)),
    tradeCount: 0,
    isFinal: true,
    symbolInterval: `${symbol}_${interval}`,
    source: 'Bitget',
  };
}

/**
 * Parse and format the incoming market ticker (24h stats) data from Bitget WebSocket.
 * @param {Object} data - Ticker data object from Bitget.
 * @returns {Object} - Formatted market data.
 */
function parseMarketData(data) {
  return {
    symbol: data.instId,
    lastPrice: parseFloat(data.lastPr),
    high24h: parseFloat(data.high24h),
    low24h: parseFloat(data.low24h),
    change24h: parseFloat(data.change24h),
    volume24h: parseFloat(data.baseVol),
    priceChangePercent: parseFloat(data.changePct24h),
    timestamp: new Date(Number(data.ts)),
  };
}

/**
 * Converts interval string like '1m', '5m', '1h', '1d' to milliseconds.
 */
function getIntervalMs(interval) {
  const num = parseInt(interval);
  if (interval.endsWith('m')) return num * 60 * 1000;
  if (interval.endsWith('h')) return num * 60 * 60 * 1000;
  if (interval.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  return 60 * 1000; // fallback 1 minute
}

module.exports = {
  parseTradeData,
  parseOrderBookData,
  parseKlineMessage,
  parseMarketData,
  getIntervalMs,
};
