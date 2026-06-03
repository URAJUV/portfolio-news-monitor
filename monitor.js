const sendTelegram = require("./telegram");

(async () => {
  await sendTelegram(
    "🚀 Portfolio Monitor Started Successfully"
  );

  console.log("Success");
})();
