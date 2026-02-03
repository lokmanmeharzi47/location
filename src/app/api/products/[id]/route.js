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

        // Parse variants JSON
        let variants = [];
        try {
            variants = product.variants ? JSON.parse(product.variants) : [];
        } catch {
            variants = [];
        }

        // Parse legacy colors (for backward compatibility)
        let colors = [];
        try {
            colors = product.colors ? JSON.parse(product.colors) : [];
        } catch {
            colors = [];
        }

        // If no variants but has legacy data, create default variant
        if (variants.length === 0 && (product.image_path || colors.length > 0)) {
            const defaultColor = colors[0] || '#C9A86C';
            variants = [{
                colorName: 'اللون الافتراضي',
                colorCode: defaultColor,
                images: product.image_path ? [product.image_path] : [],
                stock: product.stock
            }];
            colors.slice(1).forEach(color => {
                variants.push({
                    colorName: color,
                    colorCode: color,
                    images: [],
                    stock: 0
                });
            });
        }

        return NextResponse.json({
            success: true,
            product: {
                id: product.id,
                name: product.name,
                category: product.category_name || product.category,
                categoryId: product.category_id,
                categorySlug: product.category_slug,
                price: `${Math.floor(product.price).toLocaleString('ar-DZ')} د.ج`,
                priceRaw: product.price,
                stock: product.stock,
                status: product.status,
                image: variants[0]?.images?.[0] || product.image_path || '/images/placeholder.jpg',
                description: product.description,
                colors: colors,
                variants: variants,
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

// PUT - Update product with category_id and variants
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, category_id, category, price, stock, image_path, description, colors, variants } = body;

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

        // Handle variants - validate and stringify
        let variantsJson = null;
        if (variants && Array.isArray(variants) && variants.length > 0) {
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

        // Handle legacy colors
        let colorsJson = null;
        if (colors && Array.isArray(colors)) {
            colorsJson = JSON.stringify(colors);
        } else if (variants && variants.length > 0) {
            colorsJson = JSON.stringify(variants.map(v => v.colorCode));
        }

        // Get primary image from first variant for legacy image_path
        let primaryImage = image_path || null;
        if (!primaryImage && variants && variants.length > 0 && variants[0].images?.length > 0) {
            primaryImage = variants[0].images[0];
        }

        const affectedRows = await update(
            `UPDATE products 
             SET name = ?, category = ?, category_id = ?, price = ?, stock = ?, status = ?, image_path = ?, description = ?, colors = ?, variants = ?, updated_at = NOW()
             WHERE id = ?`,
            [
                name,
                categoryName || 'أخرى',
                category_id || null,
                parseFloat(price),
                parseInt(stock) || 0,
                status,
                primaryImage,
                description || null,
                colorsJson,
                variantsJson,
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
