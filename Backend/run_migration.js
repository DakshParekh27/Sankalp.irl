const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'db', 'migrations', 'interactive_feed.sql'), 'utf-8');
        await client.query(sql);
        console.log('Migration ran successfully!');
    } catch (error) {
        console.error('Migration failed to run:', error);
    } finally {
        await client.end();
    }
}

runMigration();
