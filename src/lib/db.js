import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in environment variables");
}

// Optimized pool configuration for Supabase on Serverless (Vercel)
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3, // Conservative connection limit for serverless lambdas
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000, // 5s fast-fail timeout to prevent hanging requests
    allowExitOnIdle: true, // Allow serverless processes to terminate cleanly
};

let pool;

// Maintain a single pool instance across warm serverless lambdas
if (!globalThis.dbPool) {
    globalThis.dbPool = new Pool(poolConfig);
}
pool = globalThis.dbPool;

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
