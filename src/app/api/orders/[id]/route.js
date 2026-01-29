import { NextResponse } from 'next/server';
import { queryOne, update, remove } from '@/lib/db';

// GET - Fetch single order
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const order = await queryOne(
            `SELECT o.*, p.name as product_name_ref 
       FROM orders o 
       LEFT JOIN products p ON o.product_id = p.id 
       WHERE o.id = ?`,
            [id]
        );

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'الطلب غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.order_number,
                dbId: order.id,
                customer: order.customer_name,
                phone: order.phone,
                product: order.product_name || order.product_name_ref || 'غير محدد',
                productId: order.product_id,
                color: order.color || '-',
                size: order.size || '-',
                total: `${(order.total || 0).toLocaleString('ar-DZ')} د.ج`,
                totalRaw: order.total,
                status: order.status,
                wilaya: order.wilaya || '-',
                date: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : '-',
                address: order.address,
                notes: order.notes,
            }
        });

    } catch (error) {
        console.error('Get order error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب الطلب' },
            { status: 500 }
        );
    }
}

// PUT - Update order (mainly status)
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, customer_name, phone, color, size, total, wilaya, address, notes } = body;

        // Check if order exists
        const existing = await queryOne('SELECT id FROM orders WHERE id = ?', [id]);
        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'الطلب غير موجود' },
                { status: 404 }
            );
        }

        // If only updating status
        if (status && Object.keys(body).length === 1) {
            const affectedRows = await update(
                'UPDATE orders SET status = ? WHERE id = ?',
                [status, id]
            );

            return NextResponse.json({
                success: true,
                message: 'تم تحديث حالة الطلب بنجاح',
                affectedRows,
            });
        }

        // Full update
        const affectedRows = await update(
            `UPDATE orders 
       SET status = ?, customer_name = ?, phone = ?, color = ?, size = ?, 
           total = ?, wilaya = ?, address = ?, notes = ?
       WHERE id = ?`,
            [
                status || 'قيد التنفيذ',
                customer_name,
                phone,
                color || null,
                size || null,
                total ? parseFloat(total) : null,
                wilaya || null,
                address || null,
                notes || null,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'تم تحديث الطلب بنجاح',
            affectedRows,
        });

    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في تحديث الطلب' },
            { status: 500 }
        );
    }
}

// DELETE - Delete order
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const affectedRows = await remove(
            'DELETE FROM orders WHERE id = ?',
            [id]
        );

        if (affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'الطلب غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف الطلب بنجاح',
        });

    } catch (error) {
        console.error('Delete order error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في حذف الطلب' },
            { status: 500 }
        );
    }
}
