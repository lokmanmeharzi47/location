import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in environment variables");
}

// Optimized pool configuration for Supabase
// Optimized pool configuration for Supabase
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5, // Reduced pool size for faster initial connections
    idleTimeoutMillis: 60000, // Keep connections alive longer
    connectionTimeoutMillis: 20000, // Increased timeout to 20s
    keepAlive: true, // Keep TCP connections alive
    keepAliveInitialDelayMillis: 10000,
};

let pool;

// Use global singleton in development to prevent connection exhaustion during HMR
if (process.env.NODE_ENV === 'production') {
    pool = new Pool(poolConfig);
} else {
    if (!global.dbPool) {
        global.dbPool = new Pool(poolConfig);
    }
    pool = global.dbPool;
}

// Prewarm connection on module load (only if not already warmed in this process)
let connectionWarmed = false;
async function warmConnection() {
    if (connectionWarmed) return;
    try {
        // Just a simple query to ensure connection is established
        await pool.query("SELECT 1");
        connectionWarmed = true;
        console.log("Database connection warmed up");
    } catch (e) {
        console.error("Failed to warm connection:", e.message);
    }
}
// Don't await this, let it happen in background
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
