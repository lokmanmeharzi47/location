import { NextResponse } from 'next/server';
import { query, queryOne, update, remove } from '@/lib/db';

// GET - Fetch single product with category info
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const product = await queryOne(
            `SELECT p.*, c.name as category_name, c.slug as category_slug
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = ?`,
            [id]
        );

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'المنتج غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            product: {
                id: product.id,
                name: product.name,
                category: product.category_name || product.category,
                categoryId: product.category_id,
                categorySlug: product.category_slug,
                price: `${product.price.toLocaleString('ar-DZ')} د.ج`,
                priceRaw: product.price,
                stock: product.stock,
                status: product.status,
                image: product.image_path || '/images/placeholder.jpg',
                description: product.description,
                createdAt: product.created_at,
            }
        });

    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب المنتج' },
            { status: 500 }
        );
    }
}

// PUT - Update product with category_id
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, category_id, category, price, stock, image_path, description } = body;

        // Check if product exists
        const existing = await queryOne('SELECT id FROM products WHERE id = ?', [id]);
        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'المنتج غير موجود' },
                { status: 404 }
            );
        }

        // Determine status based on stock
        const status = parseInt(stock) > 0 ? 'متوفر' : 'نفذ';

        // Get category name if category_id provided
        let categoryName = category;
        if (category_id) {
            const catResult = await query('SELECT name FROM categories WHERE id = ?', [category_id]);
            if (catResult.length > 0) {
                categoryName = catResult[0].name;
            }
        }

        const affectedRows = await update(
            `UPDATE products 
             SET name = ?, category = ?, category_id = ?, price = ?, stock = ?, status = ?, image_path = ?, description = ?
             WHERE id = ?`,
            [
                name,
                categoryName || 'أخرى',
                category_id || null,
                parseFloat(price),
                parseInt(stock) || 0,
                status,
                image_path || null,
                description || null,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'تم تحديث المنتج بنجاح',
            affectedRows,
        });

    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في تحديث المنتج' },
            { status: 500 }
        );
    }
}

// DELETE - Delete product
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const affectedRows = await remove(
            'DELETE FROM products WHERE id = ?',
            [id]
        );

        if (affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'المنتج غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف المنتج بنجاح',
        });

    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في حذف المنتج' },
            { status: 500 }
        );
    }
}
