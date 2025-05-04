const axios = require('axios');

// Fetch the top 15 tokens by 24h volume
async function getTop15Tokens() {
  try {
    const response = await axios.get('https://api.bitget.com/api/spot/v1/market/allTickers');
    const allTickers = response.data.data.tickers;

    // Sort tickers by 24h volume and fetch the top 15
    const topTokens = allTickers
      .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))  // Sort by 24h volume
      .slice(0, 15)  // Get the top 15 tokens

    return topTokens.map(ticker => ticker.symbol);  // Return an array of top 15 token symbols
  } catch (error) {
    console.error('Error fetching top tokens:', error);
    return [];
  }
}

module.exports = { getTop15Tokens };
