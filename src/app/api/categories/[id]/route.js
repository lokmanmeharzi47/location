import { NextResponse } from 'next/server';
import { queryOne, update, remove } from '@/lib/db';

// GET - Fetch single category
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const category = await queryOne(
            'SELECT * FROM categories WHERE id = ?',
            [id]
        );

        if (!category) {
            return NextResponse.json(
                { success: false, message: 'الفئة غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            category: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                image: category.image_path,
                href: category.href,
                displayOrder: category.display_order,
                isActive: category.is_active,
                createdAt: category.created_at,
            }
        });

    } catch (error) {
        console.error('Get category error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب الفئة' },
            { status: 500 }
        );
    }
}

// PUT - Update category
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, image_path, href, display_order, is_active } = body;

        const existing = await queryOne('SELECT id FROM categories WHERE id = ?', [id]);
        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'الفئة غير موجودة' },
                { status: 404 }
            );
        }

        const affectedRows = await update(
            `UPDATE categories 
       SET name = ?, description = ?, image_path = ?, href = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
            [
                name,
                description || null,
                image_path || null,
                href || null,
                parseInt(display_order) || 0,
                is_active !== false,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'تم تحديث الفئة بنجاح',
            affectedRows,
        });

    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في تحديث الفئة' },
            { status: 500 }
        );
    }
}

// DELETE - Delete category
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const affectedRows = await remove(
            'DELETE FROM categories WHERE id = ?',
            [id]
        );

        if (affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'الفئة غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف الفئة بنجاح',
        });

    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في حذف الفئة' },
            { status: 500 }
        );
    }
}
