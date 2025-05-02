const axios = require('axios');

const COINCAP_API_KEY = process.env.COINCAP_API_KEY;
const BASE_URL = 'https://rest.coincap.io/v3/assets';

async function fetchCoinCapPrice(symbol = 'bitcoin') {
  try {
    const response = await axios.get(`${BASE_URL}/${symbol}`, {
      headers: {
        Authorization: `Bearer ${COINCAP_API_KEY}`,
      },
    });

    const price = parseFloat(response.data.data.priceUsd);
    return price;
  } catch (error) {
    console.error('Error fetching CoinCap price:', error.message);
    return null;
  }
}

module.exports = fetchCoinCapPrice;
