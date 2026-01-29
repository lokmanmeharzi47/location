import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch dashboard statistics
export async function GET() {
    try {
        // Get total orders count
        const [ordersResult] = await query('SELECT COUNT(*) as count FROM orders');
        const totalOrders = ordersResult?.count || 0;

        // Get total revenue
        const [revenueResult] = await query(
            "SELECT SUM(total) as total FROM orders WHERE status != 'ملغي'"
        );
        const totalRevenue = revenueResult?.total || 0;

        // Get orders count by status
        const ordersByStatus = await query(
            'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
        );

        // Get products count
        const [productsResult] = await query('SELECT COUNT(*) as count FROM products');
        const totalProducts = productsResult?.count || 0;

        // Get low stock products count (stock < 5)
        const [lowStockResult] = await query(
            'SELECT COUNT(*) as count FROM products WHERE stock < 5 AND stock > 0'
        );
        const lowStockProducts = lowStockResult?.count || 0;

        // Get out of stock products
        const [outOfStockResult] = await query(
            'SELECT COUNT(*) as count FROM products WHERE stock = 0'
        );
        const outOfStockProducts = outOfStockResult?.count || 0;

        // Get recent orders (last 5)
        const recentOrders = await query(
            `SELECT order_number, customer_name, product_name, total, status, order_date 
       FROM orders 
       ORDER BY order_date DESC 
       LIMIT 5`
        );

        // Get top selling products
        const topProducts = await query(
            `SELECT p.name, COUNT(o.id) as sales 
       FROM products p 
       LEFT JOIN orders o ON p.id = o.product_id 
       WHERE o.status != 'ملغي' OR o.id IS NULL
       GROUP BY p.id, p.name 
       ORDER BY sales DESC 
       LIMIT 5`
        );

        // Calculate percentage changes (mock for now, would need historical data)
        const stats = {
            totalOrders: {
                value: totalOrders.toLocaleString('ar-DZ'),
                change: 12,
                changeType: 'increase',
            },
            totalRevenue: {
                value: `${totalRevenue.toLocaleString('ar-DZ')} د.ج`,
                change: 8,
                changeType: 'increase',
            },
            totalProducts: {
                value: totalProducts.toLocaleString('ar-DZ'),
                change: 3,
                changeType: 'increase',
            },
            lowStockProducts,
            outOfStockProducts,
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item.status] = item.count;
                return acc;
            }, {}),
            recentOrders: recentOrders.map(o => ({
                id: o.order_number,
                customer: o.customer_name,
                product: o.product_name || 'غير محدد',
                total: `${(o.total || 0).toLocaleString('ar-DZ')} د.ج`,
                status: o.status,
                date: o.order_date ? new Date(o.order_date).toISOString().split('T')[0] : '-',
            })),
            topProducts: topProducts.map(p => ({
                name: p.name,
                sales: p.sales,
            })),
        };

        return NextResponse.json({
            success: true,
            stats,
        });

    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب الإحصائيات', error: error.message },
            { status: 500 }
        );
    }
}
