require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function checkUser() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT email, role, password_hash FROM users WHERE email = 'admin@boutique-rital.dz'");
        console.log("Admin user found:", res.rows.length > 0);
        if (res.rows.length > 0) {
            const user = res.rows[0];
            console.log("Role:", user.role);
            console.log("Hash matches expected:", user.password_hash === '$2b$10$tZgggFRgvSOW27BHpxUa2.BYkQ09IjAdK624AdYlM4qGYdV.665B2');
        }
        client.release();
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

checkUser();
