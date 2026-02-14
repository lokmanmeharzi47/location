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

        // Define initial status
        const initialStatus = 'قيد التنفيذ';

        const result = await client.query(
            `INSERT INTO bookings 
             (customer_name, customer_phone, customer_email, customer_address, customer_city, 
              car_id, pickup_date, return_date, pickup_location, return_location,
              daily_rate, total_days, subtotal, extras_amount, discount_amount, total_amount,
              notes, extras, payment_method, status, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
                payment_method || 'espece',
                initialStatus
            ]
        );

        const newBookingId = result.rows[0].id;

        // Fetch car details for Google Sheet
        try {
            const carResult = await client.query('SELECT name FROM cars WHERE id = $1', [parseInt(car_id)]);
            const carName = carResult.rows[0]?.name || 'Unknown Car';

            // Send to Google Sheet if configured
            if (process.env.GOOGLE_SHEET_SCRIPT_URL) {
                const sheetData = {
                    record: {
                        id: newBookingId,
                        customer_name,
                        customer_phone,
                        cars: { name: carName }, // Structure matches Apps Script expectation
                        pickup_date,
                        return_date,
                        total_amount,
                        status: initialStatus,
                        notes,
                    }
                };

                // Don't await strictly to avoid blocking response, or await with timeout
                fetch(process.env.GOOGLE_SHEET_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sheetData)
                }).catch(err => console.error('Google Sheet Sync Error:', err));
            }
        } catch (sheetError) {
            console.error('Error preparing sheet data:', sheetError);
        }

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
