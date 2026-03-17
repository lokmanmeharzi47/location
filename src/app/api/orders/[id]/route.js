import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Fetch single booking
export async function GET(request, { params }) {
    const client = await pool.connect();

    try {
        const { id } = await params;

        const result = await client.query(
            `SELECT b.*, c.name as car_name
             FROM bookings b
             LEFT JOIN cars c ON b.car_id = c.id
             WHERE b.id = $1`,
            [id]
        );

        const booking = result.rows[0];

        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'الحجز غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order: {
                id: booking.id,
                dbId: booking.id,
                customer: booking.customer_name,
                phone: booking.customer_phone,
                email: booking.customer_email,
                product: booking.car_name || 'غير محدد',
                carId: booking.car_id,
                total: `${Math.floor(booking.total_amount || 0).toLocaleString('ar-DZ')} مليون`,
                totalRaw: booking.total_amount,
                status: booking.status,
                pickupLocation: booking.pickup_location || '-',
                returnLocation: booking.return_location || '-',
                pickupDate: booking.pickup_date ? new Date(booking.pickup_date).toISOString().split('T')[0] : '-',
                returnDate: booking.return_date ? new Date(booking.return_date).toISOString().split('T')[0] : '-',
                totalDays: booking.total_days || 0,
                address: booking.customer_address || '-',
                city: booking.customer_city || '-',
                notes: booking.notes || '',
                date: booking.created_at ? new Date(booking.created_at).toISOString().split('T')[0] : '-',
            }
        });

    } catch (error) {
        console.error('Get booking error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في جلب الحجز' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// PUT - Update booking (mainly status)
export async function PUT(request, { params }) {
    const client = await pool.connect();

    try {
        const { id } = await params;
        const body = await request.json();
        const { status, customer_name, customer_phone, notes, payment_status } = body;

        // Check if booking exists
        const existing = await client.query('SELECT id FROM bookings WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'الحجز غير موجود' },
                { status: 404 }
            );
        }

        // If only updating status
        if (status && Object.keys(body).length === 1) {
            await client.query(
                'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [status, id]
            );

            return NextResponse.json({
                success: true,
                message: 'تم تحديث حالة الحجز بنجاح',
            });
        }

        // Full update
        await client.query(
            `UPDATE bookings 
             SET status = $1, customer_name = $2, customer_phone = $3, 
                 notes = $4, payment_status = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6`,
            [
                status || 'قيد التنفيذ',
                customer_name,
                customer_phone,
                notes || null,
                payment_status || 'pending',
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'تم تحديث الحجز بنجاح',
        });

    } catch (error) {
        console.error('Update booking error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في تحديث الحجز' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Delete booking
export async function DELETE(request, { params }) {
    const client = await pool.connect();

    try {
        const { id } = await params;

        const result = await client.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'الحجز غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف الحجز بنجاح',
        });

    } catch (error) {
        console.error('Delete booking error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في حذف الحجز' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
