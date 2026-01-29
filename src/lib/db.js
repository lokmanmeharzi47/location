import mysql from 'mysql2/promise';

// Create a connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dashboard_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
});

/**
 * Execute a SQL query with prepared statements
 * @param {string} sql - SQL query with ? placeholders
 * @param {Array} params - Parameters to bind to the query
 * @returns {Promise<Array>} Query results
 */
export async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Get a single row from query results
 * @param {string} sql - SQL query with ? placeholders
 * @param {Array} params - Parameters to bind to the query
 * @returns {Promise<Object|null>} Single row or null
 */
export async function queryOne(sql, params = []) {
    const results = await query(sql, params);
    return results.length > 0 ? results[0] : null;
}

/**
 * Insert a row and return the inserted ID
 * @param {string} sql - INSERT SQL query
 * @param {Array} params - Parameters to bind
 * @returns {Promise<number>} Inserted row ID
 */
export async function insert(sql, params = []) {
    const result = await query(sql, params);
    return result.insertId;
}

/**
 * Update rows and return affected count
 * @param {string} sql - UPDATE SQL query
 * @param {Array} params - Parameters to bind
 * @returns {Promise<number>} Number of affected rows
 */
export async function update(sql, params = []) {
    const result = await query(sql, params);
    return result.affectedRows;
}

/**
 * Delete rows and return affected count
 * @param {string} sql - DELETE SQL query
 * @param {Array} params - Parameters to bind
 * @returns {Promise<number>} Number of deleted rows
 */
export async function remove(sql, params = []) {
    const result = await query(sql, params);
    return result.affectedRows;
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection success status
 */
export async function testConnection() {
    try {
        await pool.execute('SELECT 1');
        console.log('✓ Database connection successful');
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
}

// Export the pool for advanced usage
export { pool };

export default { query, queryOne, insert, update, remove, testConnection, pool };
