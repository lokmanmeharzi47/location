import { NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

// GET - Fetch all products with category info
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const categoryId = searchParams.get('category_id');
        const status = searchParams.get('status');

        let sql = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // Filter by category_id (preferred)
        if (categoryId && categoryId !== 'all') {
            sql += ' AND p.category_id = ?';
            params.push(parseInt(categoryId));
        }
        // Fallback to text category
        else if (category && category !== 'all') {
            sql += ' AND (p.category = ? OR c.name = ? OR c.slug = ?)';
            params.push(category, category, category);
        }

        if (status && status !== 'all') {
            sql += ' AND p.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY p.created_at DESC';

        const products = await query(sql, params);

        // Format products for frontend
        const formattedProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category_name || p.category,
            categoryId: p.category_id,
            categorySlug: p.category_slug,
            price: `${p.price.toLocaleString('ar-DZ')} د.ج`,
            priceRaw: p.price,
            stock: p.stock,
            status: p.status,
            image: p.image_path || '/images/placeholder.jpg',
            description: p.description,
            createdAt: p.created_at,
        }));

        return NextResponse.json({
            success: true,
            products: formattedProducts,
            total: formattedProducts.length,
        });

    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب المنتجات', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new product with category_id
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, category_id, category, price, stock, image_path, description } = body;

        // Validate required fields
        if (!name || (!category_id && !category) || price === undefined) {
            return NextResponse.json(
                { success: false, message: 'الاسم والفئة والسعر مطلوبون' },
                { status: 400 }
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

        const productId = await insert(
            `INSERT INTO products (name, category, category_id, price, stock, status, image_path, description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                categoryName || 'أخرى',
                category_id || null,
                parseFloat(price),
                parseInt(stock) || 0,
                status,
                image_path || null,
                description || null
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'تم إضافة المنتج بنجاح',
            productId: productId,
        });

    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في إضافة المنتج', error: error.message },
            { status: 500 }
        );
    }
}
