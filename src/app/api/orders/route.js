import { NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

// GET - Fetch all orders
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = searchParams.get('limit');

        let sql = `
      SELECT o.*, p.name as product_name_ref 
      FROM orders o 
      LEFT JOIN products p ON o.product_id = p.id 
      WHERE 1=1
    `;
        const params = [];

        if (status && status !== 'all') {
            sql += ' AND o.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY o.order_date DESC';

        if (limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const orders = await query(sql, params);

        // Format orders for frontend
        const formattedOrders = orders.map(o => ({
            id: o.order_number,
            dbId: o.id,
            customer: o.customer_name,
            phone: o.phone,
            product: o.product_name || o.product_name_ref || 'غير محدد',
            color: o.color || '-',
            size: o.size || '-',
            total: `${(o.total || 0).toLocaleString('ar-DZ')} د.ج`,
            totalRaw: o.total,
            status: o.status,
            wilaya: o.wilaya || '-',
            date: o.order_date ? new Date(o.order_date).toISOString().split('T')[0] : '-',
            address: o.address,
            notes: o.notes,
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            total: formattedOrders.length,
        });

    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب الطلبات', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new order
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            customer_name,
            phone,
            product_id,
            product_name,
            color,
            size,
            total,
            wilaya,
            address,
            notes
        } = body;

        // Validate required fields
        if (!customer_name || !phone || !total) {
            return NextResponse.json(
                { success: false, message: 'اسم العميل والهاتف والمجموع مطلوبون' },
                { status: 400 }
            );
        }

        // Generate order number
        const orderNumber = `#${Date.now().toString().slice(-4)}`;

        const orderId = await insert(
            `INSERT INTO orders 
       (order_number, customer_name, phone, product_id, product_name, color, size, total, wilaya, address, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber,
                customer_name,
                phone,
                product_id || null,
                product_name || null,
                color || null,
                size || null,
                parseFloat(total),
                wilaya || null,
                address || null,
                notes || null
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'تم إنشاء الطلب بنجاح',
            orderId: orderId,
            orderNumber: orderNumber,
        });

    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في إنشاء الطلب', error: error.message },
            { status: 500 }
        );
    }
}
