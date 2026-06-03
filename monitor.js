const fs = require("fs");

const portfolio = require("./portfolio.json");
const getNews = require("./news");
const sendTelegram = require("./telegram");

const SEEN_FILE = "./seen-news.json";

function loadSeenNews() {
  try {
    return JSON.parse(
      fs.readFileSync(SEEN_FILE, "utf8")
    );
  } catch {
    return {};
  }
}

function saveSeenNews(data) {
  fs.writeFileSync(
    SEEN_FILE,
    JSON.stringify(data, null, 2)
  );
}

(async () => {
  const seen = loadSeenNews();

  let newArticlesFound = 0;

  for (const stock of portfolio.stocks) {
    try {
      const news = await getNews(stock);

      for (const article of news) {
        const articleId =
          article.id ||
          article.url ||
          article.headline;

        if (seen[articleId]) {
          continue;
        }

        const message =
`📈 ${stock}

${article.headline}

${article.url}`;

        await sendTelegram(message);

        seen[articleId] = Date.now();

        newArticlesFound++;

        await new Promise((resolve) =>
          setTimeout(resolve, 1500)
        );
      }
    } catch (err) {
      console.error(
        `Error processing ${stock}:`,
        err.message
      );
    }
  }

  const sevenDays =
    7 * 24 * 60 * 60 * 1000;

  for (const key of Object.keys(seen)) {
    if (
      Date.now() - seen[key] >
      sevenDays
    ) {
      delete seen[key];
    }
  }

  saveSeenNews(seen);

  console.log(
    `Finished. New articles sent: ${newArticlesFound}`
  );
})();
