const axios = require("axios");

async function getNews(symbol) {
  const token = process.env.FINNHUB_KEY;

  // Last 7 days
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - 7);

  const formatDate = (date) =>
    date.toISOString().split("T")[0];

  const url =
    `https://finnhub.io/api/v1/company-news?symbol=${symbol}` +
    `&from=${formatDate(from)}` +
    `&to=${formatDate(today)}` +
    `&token=${token}`;

  const response = await axios.get(url);

  return response.data.slice(0, 5);
}

module.exports = getNews;
