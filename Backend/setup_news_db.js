require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS news_items (
                id SERIAL PRIMARY KEY,
                title TEXT,
                description TEXT,
                source VARCHAR(255),
                url TEXT UNIQUE,
                verdict VARCHAR(50),
                confidence NUMERIC(3,2),
                explanation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_user_submitted BOOLEAN DEFAULT FALSE
            );
        `);
        console.log("Table 'news_items' created successfully.");
    } catch (e) {
        console.error("Error creating table:", e.message);
    } finally {
        await pool.end();
    }
}
run();
