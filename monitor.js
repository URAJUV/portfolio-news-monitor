const portfolio = require("./portfolio.json");
const getNews = require("./news");
const sendTelegram = require("./telegram");

(async () => {
  for (const stock of portfolio.stocks) {
    try {
      const news = await getNews(stock);

      if (!news || news.length === 0) {
        continue;
      }

      let message = `📈 ${stock}\n\n`;

      news.forEach((article, index) => {
        message += `${index + 1}. ${article.headline}\n`;
        message += `${article.url}\n\n`;
      });

      await sendTelegram(message);

      // Avoid Telegram rate limits
      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );
    } catch (err) {
      console.error(`Error processing ${stock}`, err.message);
    }
  }

  console.log("Portfolio scan completed.");
})();
