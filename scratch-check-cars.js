require('dotenv').config();
const { pool } = require('./src/lib/db');

async function run() {
  const client = await pool.connect();
  try {
    const sql = `
            SELECT 
                c.*,
                cat.name as category_name,
                cat.slug as category_slug,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', ci.id,
                            'url', ci.image_url,
                            'order', ci.display_order,
                            'isPrimary', ci.is_primary
                        ) ORDER BY ci.display_order
                    ) FILTER (WHERE ci.id IS NOT NULL),
                    '[]'::json
                ) as images_data
            FROM cars c
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN car_images ci ON c.id = ci.car_id
            WHERE c.category_id = 6
            GROUP BY c.id, cat.name, cat.slug ORDER BY COALESCE(c.display_order, 0) ASC, LOWER(TRIM(c.name)) ASC
    `;
    const result = await client.query(sql);
    for (const car of result.rows) {
      console.log('CAR:', car.name, 'images_data:', car.images_data);
    }
  } finally {
    client.release();
    process.exit(0);
  }
}
run().catch(e => { console.error(e); process.exit(1); });
