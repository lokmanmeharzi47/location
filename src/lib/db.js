import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in environment variables");
}

// Optimized pool configuration for Supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5, // Reduced pool size for faster initial connections
    idleTimeoutMillis: 60000, // Keep connections alive longer
    connectionTimeoutMillis: 10000, // Timeout after 10s
    keepAlive: true, // Keep TCP connections alive
    keepAliveInitialDelayMillis: 10000,
});

// Prewarm connection on module load
let connectionWarmed = false;
async function warmConnection() {
    if (connectionWarmed) return;
    try {
        await pool.query("SELECT 1");
        connectionWarmed = true;
    } catch (e) {
        console.error("Failed to warm connection:", e.message);
    }
}
warmConnection();

/**
 * Convert MySQL '?' placeholders to PostgreSQL '$1, $2, ...'
 */
function convertSql(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
}

export async function query(sql, params = []) {
    try {
        const result = await pool.query(convertSql(sql), params);
        return result.rows;
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}

export async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows.length ? rows[0] : null;
}

export async function insert(sql, params = []) {
    const rows = await query(`${sql} RETURNING id`, params);
    return rows[0]?.id ?? null;
}

export async function update(sql, params = []) {
    const result = await pool.query(convertSql(sql), params);
    return result.rowCount;
}

export async function remove(sql, params = []) {
    const result = await pool.query(convertSql(sql), params);
    return result.rowCount;
}

export async function testConnection() {
    try {
        await pool.query("SELECT 1");
        return true;
    } catch (e) {
        console.error("DB connection failed:", e);
        return false;
    }
}

export { pool };
