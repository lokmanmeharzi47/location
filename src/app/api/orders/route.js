import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Fetch all bookings
export async function GET(request) {
    const client = await pool.connect();

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = searchParams.get('limit');

        let sql = `
            SELECT b.*, c.name as car_name
            FROM bookings b
            LEFT JOIN cars c ON b.car_id = c.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (status && status !== 'all') {
            sql += ` AND b.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        sql += ' ORDER BY b.created_at DESC';

        if (limit) {
            sql += ` LIMIT $${paramIndex}`;
            params.push(parseInt(limit));
        }

        const result = await client.query(sql, params);
        const bookings = result.rows;

        // Format bookings for frontend
        const formattedOrders = bookings.map(b => ({
            id: b.id,
            dbId: b.id,
            customer: b.customer_name,
            phone: b.customer_phone,
            email: b.customer_email,
            product: b.car_name || 'غير محدد',
            carId: b.car_id,
            total: `${Math.floor(b.total_amount || 0).toLocaleString('ar-DZ')} مليون`,
            totalRaw: b.total_amount,
            status: b.status || 'قيد التنفيذ',
            pickupLocation: b.pickup_location || '-',
            paymentMethod: b.payment_method || 'espece',
            returnLocation: b.return_location || '-',
            pickupDate: b.pickup_date ? new Date(b.pickup_date).toISOString().split('T')[0] : '-',
            returnDate: b.return_date ? new Date(b.return_date).toISOString().split('T')[0] : '-',
            totalDays: b.total_days || 0,
            address: b.customer_address || '-',
            city: b.customer_city || '-',
            notes: b.notes || '',
            date: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : '-',
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            total: formattedOrders.length,
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب الطلبات', error: error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// POST - Create new booking
export async function POST(request) {
    const client = await pool.connect();

    try {
        const body = await request.json();
        const {
            customer_name,
            customer_phone,
            customer_email,
            customer_address,
            customer_city,
            car_id,
            car_name,   // Extract for Sheets
            car_image,  // Extract for Sheets
            pickup_date,
            return_date,
            pickup_location,
            return_location,
            daily_rate,
            total_days,
            subtotal,
            extras_amount,
            discount_amount,
            total_amount,
            notes,
            extras,
            payment_method
        } = body;

        // Validate required fields
        if (!customer_name || !customer_phone || !car_id) {
            return NextResponse.json(
                { success: false, message: 'اسم العميل والهاتف والسيارة مطلوبون' },
                { status: 400 }
            );
        }

        const result = await client.query(
            `INSERT INTO bookings 
             (customer_name, customer_phone, customer_email, customer_address, customer_city, 
              car_id, pickup_date, return_date, pickup_location, return_location,
              daily_rate, total_days, subtotal, extras_amount, discount_amount, total_amount,
              notes, extras, payment_method, status, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'قيد التنفيذ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id`,
            [
                customer_name,
                customer_phone,
                customer_email || null,
                customer_address || null,
                customer_city || null,
                parseInt(car_id),
                pickup_date || null,
                return_date || null,
                pickup_location || null,
                return_location || null,
                parseFloat(daily_rate) || 0,
                parseInt(total_days) || 0,
                parseFloat(subtotal) || 0,
                parseFloat(extras_amount) || 0,
                parseFloat(discount_amount) || 0,
                parseFloat(total_amount) || 0,
                notes || null,
                extras || null,
                payment_method || 'espece'
            ]
        );

        const newBookingId = result.rows[0].id;

        // --- GOOGLE SHEETS SYNC (Server-Side) ---
        try {
            const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz0EoNtAxsoLbDK1tXg0ZMT_Dk_wAjRjs2vQv7UsM2v7dpUQI7T4FSYhtipUYcxqW560w/exec";

            // Construct payload for Google Sheets
            const sheetPayload = {
                order_id: newBookingId,
                customer_name,
                customer_phone,
                car_name: car_name || `Car #${car_id}`,
                car_image: car_image || "",
                total_amount: parseFloat(total_amount) || 0,
                status: 'New',
                pickup_date,
                return_date,
                notes
            };

            // Fire and forget (or await if you want to ensure it sends)
            // Using fetch without awaiting response body to speed things up
            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sheetPayload),
            });

        } catch (sheetError) {
            console.error("Google Sheets Sync Error:", sheetError);
            // We do not fail the request if Sheets sync fails
        }
        // ----------------------------------------

        return NextResponse.json({
            success: true,
            message: 'تم إنشاء الحجز بنجاح',
            bookingId: newBookingId,
        });

    } catch (error) {
        console.error('Create booking error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في إنشاء الحجز', error: error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
