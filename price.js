const axios = require("axios");

async function getQuote(symbol) {
  const token = process.env.FINNHUB_KEY;

  const response = await axios.get(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`
  );

  return response.data;
}

module.exports = getQuote;
