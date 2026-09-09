require('dotenv').config();
const { pool } = require('../src/lib/db');

async function updateMimeTypes() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            UPDATE storage.buckets 
            SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
            WHERE id = 'images'
            RETURNING *;
        `);
        console.log('Updated bucket:', res.rows[0]);
    } catch (err) {
        console.error('Error updating bucket:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

updateMimeTypes();
