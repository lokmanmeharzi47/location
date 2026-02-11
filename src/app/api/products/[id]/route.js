import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Fetch single car with category info and images
export async function GET(request, { params }) {
    const client = await pool.connect();

    try {
        const { id } = await params;

        const result = await client.query(
            `SELECT 
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
            WHERE c.id = $1
            GROUP BY c.id, cat.name, cat.slug`,
            [id]
        );

        const car = result.rows[0];

        if (!car) {
            return NextResponse.json(
                { success: false, message: 'السيارة غير موجودة' },
                { status: 404 }
            );
        }

        // Extract image URLs
        const images = car.images_data.map(img => img.url);

        // Create variants structure for compatibility
        const variants = [{
            colorName: 'Default',
            colorCode: '#333333',
            images: images,
            stock: 1
        }];

        return NextResponse.json({
            success: true,
            product: {
                id: car.id,
                name: car.name,
                category: car.category_name || 'غير مصنف',
                categoryId: car.category_id,
                categorySlug: car.category_slug,
                price: `${Math.floor(car.price_per_day).toLocaleString('ar-DZ')} مليون`,
                priceRaw: car.price_per_day,
                stock: car.status === 'disponible' ? 1 : 0,
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
            }
        });

    } catch (error) {
        console.error('Get car error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب السيارة' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// PUT - Update car and images
export async function PUT(request, { params }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { id } = await params;
        const body = await request.json();
        const { name, category_id, price, stock, description, variants } = body;

        // Check if car exists
        const existing = await client.query('SELECT id FROM cars WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'السيارة غير موجودة' },
                { status: 404 }
            );
        }

        // Extract images
        let imageUrls = [];
        if (variants && Array.isArray(variants) && variants.length > 0 && variants[0].images) {
            imageUrls = variants[0].images;
        }

        // Parse description
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

        const carStatus = parseInt(stock) > 0 ? 'disponible' : 'loué';

        // Update car
        await client.query(
            `UPDATE cars 
             SET name = $1, brand = $2, model = $3, year = $4, category_id = $5, 
                 price_per_day = $6, fuel_type = $7, transmission = $8, seats = $9,
                 status = $10, description = $11, updated_at = CURRENT_TIMESTAMP
             WHERE id = $12`,
            [
                name,
                brand,
                model,
                year,
                category_id ? parseInt(category_id) : null,
                parseFloat(price),
                fuelType,
                transmission,
                seats,
                carStatus,
                description || null,
                id
            ]
        );

        // Delete old images
        await client.query('DELETE FROM car_images WHERE car_id = $1', [id]);

        // Insert new images
        if (imageUrls.length > 0) {
            for (let i = 0; i < imageUrls.length; i++) {
                await client.query(
                    `INSERT INTO car_images (car_id, image_url, display_order, is_primary, created_at)
                     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
                    [id, imageUrls[i], i, i === 0]
                );
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            message: 'تم تحديث السيارة بنجاح',
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update car error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في تحديث السيارة' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Delete car (images auto-deleted by CASCADE)
export async function DELETE(request, { params }) {
    const client = await pool.connect();

    try {
        const { id } = await params;

        const result = await client.query('DELETE FROM cars WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'السيارة غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف السيارة بنجاح',
        });

    } catch (error) {
        console.error('Delete car error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في حذف السيارة' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
