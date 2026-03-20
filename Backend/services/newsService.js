const db = require('../config/db');
const Parser = require('rss-parser');
const cron = require('node-cron');
const Groq = require('groq-sdk');
const parser = new Parser();

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const RSS_FEEDS = [
    { source: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
    { source: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
    { source: "NDTV", url: "https://feeds.feedburner.com/ndtvnews-top-stories" }
];

async function verifyWithGroq(title, description) {
    const prompt = `You are a government fact-checking AI.

Analyze the following news and determine whether it is:
- Verified
- Fake
- Misleading

News:
${title}
${description || ""}

Check for:
- unrealistic claims
- lack of credibility
- exaggerated statements

Return strictly a valid JSON object:
{
  "verdict": "Verified" | "Fake" | "Misleading",
  "confidence": 0-1,
  "explanation": "brief reason"
}
`;

    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const resultText = chatCompletion.choices[0].message.content;
        return JSON.parse(resultText);
    } catch (error) {
        console.error("Groq AI Error during Fact-Check:", error.message);
        return {
            verdict: "Unknown",
            confidence: 0,
            explanation: "Verification failed due to AI API issue."
        };
    }
}

async function fetchAndVerifyNews() {
    console.log("[NewsService] Starting background cron job to fetch and verify RSS feeds...");
    for (const feed of RSS_FEEDS) {
        try {
            const feedData = await parser.parseURL(feed.url);
            
            // Only process top 3 news to save API boundaries temporarily per run
            const topNews = feedData.items.slice(0, 3);

            for (const item of topNews) {
                const title = item.title;
                const link = item.link;
                const description = item.contentSnippet || item.content || "";

                // Check if already in DB
                const existing = await db.query('SELECT 1 FROM news_items WHERE url = $1', [link]);
                if (existing.rows.length > 0) continue;

                console.log(`[NewsService] Verifying: ${title}`);
                
                const aiResult = await verifyWithGroq(title, description);

                const insertQuery = `
                    INSERT INTO news_items (title, description, source, url, verdict, confidence, explanation)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (url) DO NOTHING
                `;

                await db.query(insertQuery, [
                    title,
                    description.substring(0, 500),
                    feed.source,
                    link,
                    aiResult.verdict,
                    aiResult.confidence,
                    aiResult.explanation
                ]);
                console.log(`[NewsService] Saved ${feed.source} -> ${aiResult.verdict}`);
            }
        } catch (err) {
            console.error(`[NewsService] Error processing feed ${feed.source}:`, err.message);
        }
    }
    console.log("[NewsService] Cron job cycle complete.");
}

// Start cron job to run every 15 minutes
const startCronJobs = () => {
    cron.schedule('*/15 * * * *', () => {
        fetchAndVerifyNews();
    });
    // Run once on startup asynchronously
    setTimeout(fetchAndVerifyNews, 5000); 
};

module.exports = {
    startCronJobs,
    fetchAndVerifyNews,
    verifyWithGroq
};
