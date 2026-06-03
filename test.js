const getNews = require("./news");

(async () => {
  const news = await getNews("AMD");
  console.log(news);
})();
