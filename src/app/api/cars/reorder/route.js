import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request) {
    const client = await pool.connect();

    try {
        const body = await request.json();
        const { action, items, carId, display_order } = body;

        // Action 1: Auto-sort all cars alphabetically (A-Z)
        if (action === 'sort_alphabetical') {
            await client.query(`
                WITH ranked AS (
                    SELECT id, ROW_NUMBER() OVER (ORDER BY LOWER(TRIM(name)) ASC) as rnk
                    FROM cars
                )
                UPDATE cars
                SET display_order = ranked.rnk,
                    updated_at = CURRENT_TIMESTAMP
                FROM ranked
                WHERE cars.id = ranked.id;
            `);

            return NextResponse.json({
                success: true,
                message: 'تم إعادة ترتيب جميع السيارات أبجدياً بنجاح (A-Z)'
            });
        }

        // Action 2: Update a single car's display_order
        if (carId && display_order !== undefined) {
            await client.query(
                `UPDATE cars SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [parseInt(display_order), parseInt(carId)]
            );

            return NextResponse.json({
                success: true,
                message: 'تم تحديث ترتيب السيارة بنجاح'
            });
        }

        // Action 3: Bulk update an array of { id, display_order }
        if (Array.isArray(items) && items.length > 0) {
            await client.query('BEGIN');
            for (const item of items) {
                if (item.id && item.display_order !== undefined) {
                    await client.query(
                        `UPDATE cars SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                        [parseInt(item.display_order), parseInt(item.id)]
                    );
                }
            }
            await client.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'تم تحديث الترتيب بنجاح'
            });
        }

        return NextResponse.json(
            { success: false, message: 'معاملات غير صالحة' },
            { status: 400 }
        );

    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('Error reordering cars:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في إعادة ترتيب السيارات' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
