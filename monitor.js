const fs = require("fs");

const portfolio = require("./portfolio.json");
const getNews = require("./news");
const getQuote = require("./price");
const sendTelegram = require("./telegram");

const SEEN_FILE = "./seen-news.json";
const SUMMARY_FILE = "./daily-summary.json";

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJson(file, data) {
  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2)
  );
}

function normalizeHeadline(headline) {
  return headline
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(stock, headline) {
  return (
    stock +
    "-" +
    normalizeHeadline(headline)
      .split(" ")
      .slice(0, 8)
      .join("-")
  );
}

const importantWords = [
  "earnings",
  "guidance",
  "upgrade",
  "downgrade",
  "target",
  "acquisition",
  "merger",
  "buyback",
  "dividend",
  "ceo",
  "sec",
  "lawsuit",
  "partnership",
  "ai",
  "data center"
];

function isImportant(headline) {
  const text = headline.toLowerCase();

  return importantWords.some(word =>
    text.includes(word)
  );
}

(async () => {

  const seen = loadJson(SEEN_FILE, {});
  const summary = loadJson(SUMMARY_FILE, {
    date: "",
    items: []
  });

  const today =
    new Date().toISOString().split("T")[0];

  if (summary.date !== today) {
    summary.date = today;
    summary.items = [];
  }

  for (const stock of portfolio.stocks) {

    try {

      //
      // PRICE ALERTS
      //
      const quote = await getQuote(stock);

      if (
        quote &&
        quote.dp &&
        Math.abs(quote.dp) >= 5
      ) {

        await sendTelegram(
`🚨 PRICE ALERT

${stock}

Move: ${quote.dp.toFixed(2)}%

Current Price: ${quote.c}`
        );
      }

      //
      // NEWS
      //
      const news = await getNews(stock);

      if (!news || news.length === 0) {
        continue;
      }

      const unseenNews = news.filter(article => {

        const id = fingerprint(
          stock,
          article.headline
        );

        return !seen[id];

      });

      if (unseenNews.length === 0) {
        continue;
      }

      const article = unseenNews[0];

      if (!isImportant(article.headline)) {

        const id = fingerprint(
          stock,
          article.headline
        );

        seen[id] = Date.now();

        continue;
      }

      const id = fingerprint(
        stock,
        article.headline
      );

      seen[id] = Date.now();

      summary.items.push({
        stock,
        headline: article.headline,
        url: article.url
      });

      await sendTelegram(
`📈 ${stock}

${article.headline}

${article.url}`
      );

      await new Promise(resolve =>
        setTimeout(resolve, 1500)
      );

    } catch (err) {

      console.error(
        `${stock}:`,
        err.message
      );

    }
  }

  //
  // CLEANUP OLD ENTRIES
  //
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

  //
  // DAILY SUMMARY @ 8PM IST
  //
  const now = new Date();

  const istHour =
    (now.getUTCHours() + 5) % 24;

  const istMinute =
    now.getUTCMinutes() + 30;

  const sendSummary =
    istHour === 20 &&
    istMinute >= 0 &&
    istMinute <= 59;

  if (
    sendSummary &&
    summary.items.length > 0
  ) {

    let msg =
      "📊 DAILY PORTFOLIO SUMMARY\n\n";

    for (const item of summary.items) {

      msg +=
`• ${item.stock}
${item.headline}

`;

    }

    await sendTelegram(msg);

    summary.items = [];
  }

  saveJson(SEEN_FILE, seen);
  saveJson(SUMMARY_FILE, summary);

})();
