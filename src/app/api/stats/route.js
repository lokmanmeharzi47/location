import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET - Fetch dashboard statistics for Luxury location
export async function GET() {
    try {
        /* =========================
           TOTAL BOOKINGS (Reservations)
        ========================= */
        let totalBookings = 0
        try {
            const [bookingsResult] = await query(
                'SELECT COUNT(*)::int AS count FROM bookings'
            )
            totalBookings = bookingsResult?.count || 0
        } catch {
            // Table might not exist yet
            totalBookings = 0
        }

        /* =========================
           TOTAL REVENUE
        ========================= */
        let totalRevenue = 0
        try {
            const [revenueResult] = await query(
                `SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
                 FROM bookings
                 WHERE status IN ('confirmed', 'active', 'completed')`
            )
            totalRevenue = Number(revenueResult?.total || 0)
        } catch {
            totalRevenue = 0
        }

        /* =========================
           CARS COUNT
        ========================= */
        let totalCars = 0
        try {
            const [carsResult] = await query(
                'SELECT COUNT(*)::int AS count FROM cars'
            )
            totalCars = carsResult?.count || 0
        } catch {
            // Try products table as fallback
            try {
                const [productsResult] = await query(
                    'SELECT COUNT(*)::int AS count FROM products'
                )
                totalCars = productsResult?.count || 0
            } catch {
                totalCars = 0
            }
        }

        /* =========================
           CUSTOMERS COUNT
        ========================= */
        let totalCustomers = 0
        try {
            const [customersResult] = await query(
                'SELECT COUNT(DISTINCT customer_phone)::int AS count FROM bookings'
            )
            totalCustomers = customersResult?.count || 0
        } catch {
            totalCustomers = 0
        }

        /* =========================
           BOOKINGS BY STATUS
        ========================= */
        let bookingsByStatus = {}
        try {
            const bookingsByStatusRows = await query(
                'SELECT status, COUNT(*)::int AS count FROM bookings GROUP BY status'
            )
            bookingsByStatus = bookingsByStatusRows.reduce((acc, row) => {
                acc[row.status] = row.count
                return acc
            }, {})
        } catch {
            bookingsByStatus = {}
        }

        /* =========================
           RECENT BOOKINGS (last 5)
        ========================= */
        let recentBookings = []
        try {
            const recentBookingsRows = await query(`
                SELECT
                    b.id,
                    b.customer_name,
                    b.total_amount,
                    b.status,
                    b.created_at,
                    c.name as car_name
                FROM bookings b
                LEFT JOIN cars c ON c.id = b.car_id
                ORDER BY b.created_at DESC
                LIMIT 5
            `)

            recentBookings = recentBookingsRows.map(b => ({
                id: b.id,
                customer: b.customer_name,
                product: b.car_name || 'N/A',
                total: `${Math.floor(Number(b.total_amount || 0)).toLocaleString('ar-DZ')} million`,
                status: b.status,
                date: b.created_at
                    ? new Date(b.created_at).toISOString().split('T')[0]
                    : '-',
            }))
        } catch {
            recentBookings = []
        }

        /* =========================
           TOP RENTED CARS
        ========================= */
        let topCars = []
        try {
            const topCarsRows = await query(`
                SELECT
                    c.name,
                    COUNT(b.id)::int AS rentals
                FROM cars c
                LEFT JOIN bookings b ON b.car_id = c.id AND b.status IN ('confirmed', 'active', 'completed')
                GROUP BY c.id, c.name
                ORDER BY rentals DESC
                LIMIT 5
            `)

            topCars = topCarsRows.map(p => ({
                name: p.name,
                sales: p.rentals,
            }))
        } catch {
            topCars = []
        }

        /* =========================
           SALES (Total completed bookings revenue)
        ========================= */
        let totalSales = 0
        try {
            const [salesResult] = await query(
                `SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
                 FROM bookings
                 WHERE status = 'completed'`
            )
            totalSales = Number(salesResult?.total || 0)
        } catch {
            totalSales = 0
        }

        /* =========================
           FINAL RESPONSE
        ========================= */
        return NextResponse.json({
            success: true,
            stats: {
                totalOrders: {
                    value: totalBookings.toLocaleString('ar-DZ'),
                },
                totalRevenue: {
                    value: `${Math.floor(totalRevenue).toLocaleString('ar-DZ')} million`,
                },
                totalProducts: {
                    value: totalCars.toLocaleString('ar-DZ'),
                },
                totalCustomers: {
                    value: totalCustomers.toLocaleString('ar-DZ'),
                },
                totalSales: {
                    value: `${Math.floor(totalSales).toLocaleString('ar-DZ')} million`,
                },
                ordersByStatus: bookingsByStatus,
                recentOrders: recentBookings,
                topProducts: topCars,
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
