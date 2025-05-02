require('dotenv').config(); // Make sure this is at the top if not already present

const COINCAP_API_KEY = process.env.COINCAP_API_KEY;

const response = await fetch(`https://rest.coincap.io/v3/assets/${token.assetId}`, {
  headers: {
    Authorization: `Bearer ${COINCAP_API_KEY}`
  }
});
