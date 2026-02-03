import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET - Fetch dashboard statistics
export async function GET() {
    try {
        /* =========================
           TOTAL ORDERS
        ========================= */
        const [ordersResult] = await query(
            'SELECT COUNT(*)::int AS count FROM orders'
        )
        const totalOrders = ordersResult?.count || 0

        /* =========================
           TOTAL REVENUE
        ========================= */
        const [revenueResult] = await query(
            `
      SELECT COALESCE(SUM(total), 0)::numeric AS total
      FROM orders
      WHERE status IN ('confirmed', 'shipped', 'delivered')
      `
        )
        const totalRevenue = Number(revenueResult?.total || 0)

        /* =========================
           PRODUCTS COUNT
        ========================= */
        const [productsResult] = await query(
            'SELECT COUNT(*)::int AS count FROM products'
        )
        const totalProducts = productsResult?.count || 0

        /* =========================
           CUSTOMERS COUNT
        ========================= */
        const [customersResult] = await query(
            'SELECT COUNT(DISTINCT phone)::int AS count FROM orders'
        )
        const totalCustomers = customersResult?.count || 0

        /* =========================
           ORDERS BY STATUS
        ========================= */
        const ordersByStatusRows = await query(
            'SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status'
        )

        const ordersByStatus = ordersByStatusRows.reduce((acc, row) => {
            acc[row.status] = row.count
            return acc
        }, {})

        /* =========================
           RECENT ORDERS (last 5)
        ========================= */
        const recentOrdersRows = await query(`
      SELECT
        o.order_number,
        o.customer_name,
        o.total,
        o.status,
        o.order_date
      FROM orders o
      ORDER BY o.order_date DESC
      LIMIT 5
    `)

        const recentOrders = recentOrdersRows.map(o => ({
            id: o.order_number,
            customer: o.customer_name,
            total: `${Math.floor(Number(o.total || 0)).toLocaleString('ar-DZ')} د.ج`,
            status: o.status,
            date: o.order_date
                ? new Date(o.order_date).toISOString().split('T')[0]
                : '-',
        }))

        /* =========================
           TOP SELLING PRODUCTS
           (from order_items)
        ========================= */
        const topProductsRows = await query(`
      SELECT
        oi.product_name AS name,
        SUM(oi.quantity)::int AS sales
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status IN ('confirmed', 'shipped', 'delivered')
      GROUP BY oi.product_name
      ORDER BY sales DESC
      LIMIT 5
    `)

        const topProducts = topProductsRows.map(p => ({
            name: p.name,
            sales: p.sales,
        }))

        /* =========================
           FINAL RESPONSE
        ========================= */
        return NextResponse.json({
            success: true,
            stats: {
                totalOrders: {
                    value: totalOrders.toLocaleString('ar-DZ'),
                },
                totalRevenue: {
                    value: `${Math.floor(totalRevenue).toLocaleString('ar-DZ')} د.ج`,
                },
                totalProducts: {
                    value: totalProducts.toLocaleString('ar-DZ'),
                },
                totalCustomers: {
                    value: totalCustomers.toLocaleString('ar-DZ'),
                },
                ordersByStatus,
                recentOrders,
                topProducts,
            },
        })
    } catch (error) {
        console.error('Get stats error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'حدث خطأ في جلب الإحصائيات',
            },
            { status: 500 }
        )
    }
}
