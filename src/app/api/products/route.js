import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Fetch all cars with category info and images
export async function GET(request) {
    const client = await pool.connect();

    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const categoryId = searchParams.get('category_id');
        const status = searchParams.get('status');

        let sql = `
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
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Filter by category_id
        if (categoryId && categoryId !== 'all') {
            sql += ` AND c.category_id = $${paramIndex}`;
            params.push(parseInt(categoryId));
            paramIndex++;
        }
        // Fallback to text category
        else if (category && category !== 'all') {
            sql += ` AND (cat.name ILIKE $${paramIndex} OR cat.slug ILIKE $${paramIndex})`;
            params.push(`%${category}%`);
            paramIndex++;
        }

        if (status && status !== 'all') {
            sql += ` AND c.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        sql += ' GROUP BY c.id, cat.name, cat.slug ORDER BY c.created_at DESC';

        const result = await client.query(sql, params);
        const cars = result.rows;

        // Format cars for frontend
        const formattedCars = cars.map(car => {
            // Extract image URLs from images_data
            const images = car.images_data.map(img => img.url);

            // Create variants structure for compatibility
            const variants = [{
                colorName: 'Default',
                colorCode: '#333333',
                images: images,
                stock: 1
            }];

            return {
                id: car.id,
                name: car.name,
                category: car.category_name || 'غير مصنف',
                categoryId: car.category_id,
                categorySlug: car.category_slug,
                price: car.price_per_day,
                priceRaw: car.price_per_day,
                stock: car.status === 'disponible' ? 1 : 0,
                sales: 0,
                status: car.status === 'disponible' ? 'متوفر' : 'محجوز',
                image: images[0] || '/images/placeholder.svg',
                description: car.description,
                colors: [],
                variants: variants,
                // Car-specific fields
                brand: car.brand,
                model: car.model,
                year: car.year,
                fuelType: car.fuel_type,
                transmission: car.transmission,
                seats: car.seats,
                doors: car.doors,
                createdAt: car.created_at,
            };
        });

        const response = NextResponse.json({
            success: true,
            products: formattedCars,
            total: formattedCars.length,
        });

        response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

        return response;

    } catch (error) {
        console.error('Get cars error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب السيارات', error: error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// POST - Create new car with images
export async function POST(request) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const body = await request.json();
        const { name, category_id, price, stock, description, variants } = body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json(
                { success: false, message: 'اسم السيارة مطلوب' },
                { status: 400 }
            );
        }

        if (!category_id) {
            return NextResponse.json(
                { success: false, message: 'الفئة مطلوبة' },
                { status: 400 }
            );
        }

        if (price === undefined || price === null || price === '') {
            return NextResponse.json(
                { success: false, message: 'السعر مطلوب' },
                { status: 400 }
            );
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return NextResponse.json(
                { success: false, message: 'السعر غير صالح' },
                { status: 400 }
            );
        }

        // Validate category exists
        const catResult = await client.query('SELECT id, name FROM categories WHERE id = $1', [parseInt(category_id)]);
        if (catResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'الفئة المحددة غير موجودة' },
                { status: 400 }
            );
        }

        // Extract images from variants
        let imageUrls = [];
        if (variants && Array.isArray(variants) && variants.length > 0 && variants[0].images) {
            imageUrls = variants[0].images;
        }

        // Parse description for car details
        let brand = '', model = '', year = new Date().getFullYear();
        let fuelType = 'Essence', transmission = 'Automatique', seats = 5;

        if (description) {
            const parts = description.split(' | ');
            if (parts[0]) {
                const nameParts = parts[0].split(' ');
                brand = nameParts[0] || '';
                model = nameParts[1] || '';
                year = parseInt(nameParts[2]) || new Date().getFullYear();
            }
            if (parts[1]) fuelType = parts[1];
            if (parts[2]) transmission = parts[2];
            if (parts[3]) seats = parseInt(parts[3]) || 5;
        }

        // Insert car
        const carStatus = stock > 0 ? 'disponible' : 'loué';

        const insertQuery = `
            INSERT INTO cars (name, year, category_id, price_per_day, fuel_type, transmission, seats, status, description, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        `;

        const result = await client.query(insertQuery, [
            name.trim(),
            year,
            parseInt(category_id),
            parsedPrice,
            fuelType,
            transmission,
            seats,
            carStatus,
            description || null
        ]);

        const carId = result.rows[0].id;

        // Insert images into car_images table
        if (imageUrls.length > 0) {
            for (let i = 0; i < imageUrls.length; i++) {
                await client.query(
                    `INSERT INTO car_images (car_id, image_url, display_order, is_primary, created_at)
                     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
                    [carId, imageUrls[i], i, i === 0]
                );
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            message: 'تم إضافة السيارة بنجاح',
            productId: carId,
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create car error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في إضافة السيارة', error: error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
