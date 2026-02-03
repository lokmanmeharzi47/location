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
            sql += ' AND (p.category ILIKE ? OR c.name ILIKE ? OR c.slug ILIKE ?)';
            params.push(category, category, category);
        }

        if (status && status !== 'all') {
            sql += ' AND p.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY p.created_at DESC';

        const products = await query(sql, params);

        // Format products for frontend
        const formattedProducts = products.map(p => {
            // Parse variants JSON
            let variants = [];
            try {
                variants = p.variants ? JSON.parse(p.variants) : [];
            } catch {
                variants = [];
            }

            // Parse legacy colors (for backward compatibility)
            let colors = [];
            try {
                colors = p.colors ? JSON.parse(p.colors) : [];
            } catch {
                colors = [];
            }

            // If no variants but has legacy data, create default variant
            if (variants.length === 0 && (p.image_path || colors.length > 0)) {
                const defaultColor = colors[0] || '#C9A86C';
                variants = [{
                    colorName: 'اللون الافتراضي',
                    colorCode: defaultColor,
                    images: p.image_path ? [p.image_path] : [],
                    stock: p.stock
                }];
                // Add additional colors as separate variants if they exist
                colors.slice(1).forEach(color => {
                    variants.push({
                        colorName: color,
                        colorCode: color,
                        images: [],
                        stock: 0
                    });
                });
            }

            return {
                id: p.id,
                name: p.name,
                category: p.category_name || p.category,
                categoryId: p.category_id,
                categorySlug: p.category_slug,
                price: `${Math.floor(p.price).toLocaleString('ar-DZ')} د.ج`,
                priceRaw: p.price,
                stock: p.stock,
                sales: p.sales || 0,
                status: p.status,
                image: variants[0]?.images?.[0] || p.image_path || '/images/placeholder.jpg',
                description: p.description,
                colors: colors, // Keep for backward compatibility
                variants: variants,
                createdAt: p.created_at,
            };
        });

        const response = NextResponse.json({
            success: true,
            products: formattedProducts,
            total: formattedProducts.length,
        });

        // Cache for 2 minutes
        response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

        return response;

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
        const { name, category_id, price, stock, image_path, description, colors, variants } = body;

        // ====== VALIDATION ======
        // 1. Validate required fields
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json(
                { success: false, message: 'اسم المنتج مطلوب' },
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

        // 2. Parse and validate price
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return NextResponse.json(
                { success: false, message: 'السعر غير صالح' },
                { status: 400 }
            );
        }

        // 3. Validate category_id exists in database
        const catResult = await query('SELECT id, name FROM categories WHERE id = ?', [parseInt(category_id)]);
        if (catResult.length === 0) {
            return NextResponse.json(
                { success: false, message: 'الفئة المحددة غير موجودة' },
                { status: 400 }
            );
        }
        const categoryName = catResult[0].name;

        // 4. Handle variants - validate and stringify
        let variantsJson = null;
        if (variants && Array.isArray(variants) && variants.length > 0) {
            // Validate variant structure
            for (const variant of variants) {
                if (!variant.colorCode || !variant.colorName) {
                    return NextResponse.json(
                        { success: false, message: 'كل متغير يجب أن يحتوي على اسم اللون ورمزه' },
                        { status: 400 }
                    );
                }
                if (!Array.isArray(variant.images)) {
                    variant.images = [];
                }
            }
            variantsJson = JSON.stringify(variants);
        }

        // 5. Handle legacy colors (for backward compatibility)
        let colorsValue = null;
        if (colors && Array.isArray(colors) && colors.length > 0) {
            colorsValue = JSON.stringify(colors);
        } else if (variants && variants.length > 0) {
            // Extract colors from variants for backward compatibility
            colorsValue = JSON.stringify(variants.map(v => v.colorCode));
        }

        // Get first image from first variant for legacy image_path
        let primaryImage = image_path || null;
        if (!primaryImage && variants && variants.length > 0 && variants[0].images?.length > 0) {
            primaryImage = variants[0].images[0];
        }

        // ====== INSERT PRODUCT ======
        // Determine status based on stock
        const parsedStock = parseInt(stock) || 0;
        const status = parsedStock > 0 ? 'متوفر' : 'نفذ';

        const productId = await insert(
            `INSERT INTO products (name, category, category_id, price, stock, status, image_path, description, colors, variants, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                name.trim(),
                categoryName,
                parseInt(category_id),
                parsedPrice,
                parsedStock,
                status,
                primaryImage,
                description || null,
                colorsValue,
                variantsJson
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
