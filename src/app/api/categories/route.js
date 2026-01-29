import { NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

// GET - Fetch all categories
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        let sql = 'SELECT * FROM categories';
        const params = [];

        if (activeOnly) {
            sql += ' WHERE is_active = TRUE';
        }

        sql += ' ORDER BY display_order ASC, created_at DESC';

        const categories = await query(sql, params);

        const formattedCategories = categories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            image: c.image_path || '/images/placeholder.jpg',
            href: c.href || `/design/${c.slug}`,
            displayOrder: c.display_order,
            isActive: c.is_active,
            createdAt: c.created_at,
        }));

        return NextResponse.json({
            success: true,
            categories: formattedCategories,
            total: formattedCategories.length,
        });

    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب الفئات', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new category
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, image_path, href, display_order } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, message: 'اسم الفئة مطلوب' },
                { status: 400 }
            );
        }

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u0600-\u06FF-]/g, '')
            + '-' + Date.now().toString().slice(-4);

        const categoryId = await insert(
            `INSERT INTO categories (name, slug, description, image_path, href, display_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name,
                slug,
                description || null,
                image_path || null,
                href || `/design/${slug}`,
                parseInt(display_order) || 0
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'تم إضافة الفئة بنجاح',
            categoryId: categoryId,
        });

    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في إضافة الفئة', error: error.message },
            { status: 500 }
        );
    }
}
