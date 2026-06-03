const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyze(stock, news) {

  const prompt = `
Analyze the following news.

Stock: ${stock}

News:
${JSON.stringify(news)}

Return JSON:

{
  "sentiment":"positive|negative|neutral",
  "impact":"low|medium|high",
  "summary":"..."
}
`;

  const result = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return result.choices[0].message.content;
}

module.exports = analyze;
