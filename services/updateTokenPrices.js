const COINCAP_API_KEY = process.env.https://rest.coincap.io/v3/assets?apiKey=6ba0e905908d943ad0aca41ffcd74342947025973e52a82c670373f38eccbabe;

const response = await fetch(`https://rest.coincap.io/v3/assets/${token.assetId}`, {
  headers: {
    Authorization: `Bearer ${COINCAP_API_KEY}`
  }
});
