// utils/parseHelpers.js

/**
 * Parse and format the incoming trade data from Bitget WebSocket.
 * @param {Object} tradeData - The raw trade data from Bitget WebSocket.
 * @returns {Object} - The formatted trade data to store in the database.
 */
function parseTradeData(tradeData) {
  return {
    symbol: tradeData.symbol,  // Symbol for the trading pair (e.g., BTC-USDT)
    price: parseFloat(tradeData.price),  // Price of the asset in the trade
    quantity: parseFloat(tradeData.size),  // Quantity of the asset in the trade
    time: new Date(tradeData.timestamp),  // Timestamp of the trade
    isBuy: tradeData.side === 'buy',  // Whether the trade was a buy or sell
  };
}

/**
 * Parse and format the incoming order book data from Bitget WebSocket.
 * @param {Object} orderBookData - The raw order book data from Bitget WebSocket.
 * @returns {Object} - The formatted order book data to store in the database.
 */
function parseOrderBookData(orderBookData) {
  return {
    symbol: orderBookData.symbol,  // Symbol for the trading pair (e.g., BTC-USDT)
    bids: orderBookData.bids.map(([price, quantity]) => ({
      price: parseFloat(price),  // Bid price
      quantity: parseFloat(quantity),  // Quantity for the bid
    })),
    asks: orderBookData.asks.map(([price, quantity]) => ({
      price: parseFloat(price),  // Ask price
      quantity: parseFloat(quantity),  // Quantity for the ask
    })),
    time: new Date(orderBookData.timestamp),  // Timestamp of the order book update
  };
}

/**
 * Parse and format the incoming kline (candlestick) data from Bitget WebSocket.
 * @param {Object} klineData - The raw kline data from Bitget WebSocket.
 * @returns {Object} - The formatted kline data to store in the database.
 */
function parseKlineData(klineData) {
  return {
    symbol: klineData.symbol,  // Symbol for the trading pair (e.g., BTC-USDT)
    open: parseFloat(klineData.open),  // Opening price for the candlestick
    close: parseFloat(klineData.close),  // Closing price for the candlestick
    high: parseFloat(klineData.high),  // Highest price during the candlestick
    low: parseFloat(klineData.low),  // Lowest price during the candlestick
    volume: parseFloat(klineData.volume),  // Volume traded during the candlestick
    time: new Date(klineData.timestamp),  // Timestamp of the candlestick
  };
}

/**
 * Parse and format the incoming 24h market data from Bitget WebSocket.
 * @param {Object} marketData - The raw 24h market data from Bitget WebSocket.
 * @returns {Object} - The formatted 24h market data to store in the database.
 */
function parseMarketData(marketData) {
  return {
    symbol: marketData.symbol,  // Symbol for the trading pair (e.g., BTC-USDT)
    priceChange: parseFloat(marketData.priceChange),  // Price change over the last 24h
    priceChangePercent: parseFloat(marketData.priceChangePercent),  // Price change percentage
    highPrice: parseFloat(marketData.highPrice),  // 24h high price
    lowPrice: parseFloat(marketData.lowPrice),  // 24h low price
    volume: parseFloat(marketData.volume),  // 24h trading volume
    openPrice: parseFloat(marketData.openPrice),  // 24h opening price
  };
}

module.exports = {
  parseTradeData,
  parseOrderBookData,
  parseKlineData,
  parseMarketData,
};
