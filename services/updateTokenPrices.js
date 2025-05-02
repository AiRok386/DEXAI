const COINCAP_API_KEY = process.env.https://rest.coincap.io/v3/assets?apiKey=6ba0e905909d943ad2aca41ffcd74346948025973e52a82c670373f38eccbabe;

const response = await fetch(`https://rest.coincap.io/v3/assets/${token.assetId}`, {
  headers: {
    Authorization: `Bearer ${COINCAP_API_KEY}`
  }
});
