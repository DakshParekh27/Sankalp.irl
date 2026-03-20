const db = require('../config/db');
const newsService = require('../services/newsService');

exports.getAllNews = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM news_items ORDER BY created_at DESC LIMIT 50');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getVerifiedNews = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM news_items WHERE verdict = 'Verified' ORDER BY created_at DESC LIMIT 20");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching verified news:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.verifyManualNews = async (req, res) => {
    try {
        const { text, url } = req.body;
        if (!text && !url) {
            return res.status(400).json({ error: "Please provide text or a URL to verify." });
        }

        const inputData = text || url;
        const verification = await newsService.verifyWithGroq(inputData, inputData);

        // Store the user submitted query
        const insertQuery = `
            INSERT INTO news_items (title, description, source, url, verdict, confidence, explanation, is_user_submitted)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            RETURNING *
        `;
        const result = await db.query(insertQuery, [
            text ? text.substring(0, 100) : "URL Submission",
            inputData,
            "User Submission",
            url || null,
            verification.verdict,
            verification.confidence,
            verification.explanation
        ]);

        res.json({ success: true, verification: result.rows[0] });
    } catch (error) {
        console.error("Manual verification error:", error);
        res.status(500).json({ error: "Failed to verify news." });
    }
};
