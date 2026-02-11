import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    const client = await pool.connect();

    try {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.price_per_day,
                c.transmission,
                c.category_id,
                cat.name as category_name,
                (
                    SELECT image_url 
                    FROM car_images 
                    WHERE car_id = c.id 
                    ORDER BY is_primary DESC, display_order ASC 
                    LIMIT 1
                ) as image_url
            FROM cars c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.status = 'disponible'
            ORDER BY c.created_at DESC
        `;

        const result = await client.query(query);

        const cars = result.rows.map(car => ({
            id: car.id,
            name: car.name,
            price: car.price_per_day,
            transmission: car.transmission,
            category: car.category_name,
            image: car.image_url || '/images/placeholder.jpg', // Fallback image
        }));

        return NextResponse.json(cars);

    } catch (error) {
        console.error('Error fetching cars:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cars' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
