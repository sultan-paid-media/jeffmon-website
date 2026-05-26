// netlify/functions/briefing.js
// Yeh file server pe run hoti hai — API key safe rehti hai

exports.handler = async function () {

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const prompt = `Today is ${today}. You are a senior financial analyst at JeffMon Alternative Investments, a Dubai-based boutique asset management firm focused on global markets.

Write a concise daily market briefing for today. Return ONLY a valid JSON object with NO extra text, NO markdown, NO backticks. Use this exact structure:

{
  "text": "2-3 sentence market briefing covering today's key macro themes, equity moves, and what it means for investors. Mention specific indices, commodities, or geopolitical factors relevant today. End with one actionable insight for the week.",
  "articles": [
    {
      "src": "CNBC",
      "headline": "A realistic financial headline relevant to today's market",
      "url": "https://www.cnbc.com/",
      "tag": "Markets"
    },
    {
      "src": "Bloomberg",
      "headline": "A realistic macro or rates headline for today",
      "url": "https://www.bloomberg.com/",
      "tag": "Macro"
    },
    {
      "src": "Yahoo Finance",
      "headline": "A realistic tech or equity headline for today",
      "url": "https://finance.yahoo.com/",
      "tag": "Tech"
    },
    {
      "src": "CNBC",
      "headline": "A realistic geopolitics or energy headline for today",
      "url": "https://www.cnbc.com/",
      "tag": "Geopolitics"
    },
    {
      "src": "Yahoo Finance",
      "headline": "A realistic headline about Magnificent 7 or AI stocks today",
      "url": "https://finance.yahoo.com/",
      "tag": "Markets"
    }
  ]
}

Rules:
- text must sound like a professional investment analyst, not a news reporter
- Headlines must sound like real financial journalism for today's date
- Tags must be one of: Markets, Macro, Tech, Geopolitics, Energy, Rates
- Return ONLY the JSON — no explanation, no markdown`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data    = await response.json();
    const rawText = data.content[0].text.trim();

    // Strip any accidental markdown backticks
    const cleaned = rawText.replace(/^```json|^```|```$/gm, '').trim();
    const parsed  = JSON.parse(cleaned);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate briefing', detail: err.message })
    };
  }
};
