const portfolio = require("./portfolio.json");

const getNews = require("./news");
const analyze = require("./sentiment");
const sendTelegram = require("./telegram");

(async () => {

  for (const stock of portfolio.stocks) {

    const news = await getNews(stock);

    const result = await analyze(stock, news);

    const parsed = JSON.parse(result);

    if (
      parsed.impact === "high" &&
      parsed.sentiment !== "neutral"
    ) {

      await sendTelegram(
`
${parsed.sentiment.toUpperCase()} ALERT

${stock}

${parsed.summary}
`
      );
    }
  }

})();
