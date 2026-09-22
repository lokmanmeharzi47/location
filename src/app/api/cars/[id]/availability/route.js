import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const { id } = await params;
    const carId = parseInt(id, 10);

    if (isNaN(carId)) {
        return NextResponse.json(
            { success: false, message: 'Identifiant de véhicule invalide' },
            { status: 400 }
        );
    }

    const client = await pool.connect();

    try {
        const { searchParams } = new URL(request.url);
        const pickupDate = searchParams.get('pickup_date');
        const returnDate = searchParams.get('return_date');

        // Fetch all active bookings for this car from today onwards
        const sql = `
            SELECT 
                id,
                pickup_date,
                return_date,
                status
            FROM bookings
            WHERE car_id = $1
              AND (status IS NULL OR status NOT IN ('cancelled', 'ملغي', 'ملغى', 'annulée', 'annulee', 'rejected', 'refused'))
              AND return_date >= CURRENT_DATE
            ORDER BY pickup_date ASC;
        `;

        const result = await client.query(sql, [carId]);

        const bookedRanges = result.rows.map(row => {
            const start = row.pickup_date ? new Date(row.pickup_date).toISOString().split('T')[0] : null;
            const end = row.return_date ? new Date(row.return_date).toISOString().split('T')[0] : null;
            return {
                id: row.id,
                startDate: start,
                endDate: end,
            };
        }).filter(r => r.startDate && r.endDate);

        // Optional check for specific date range
        let isAvailable = true;
        let conflict = null;

        if (pickupDate && returnDate) {
            const requestedPickup = new Date(`${pickupDate}T00:00:00`);
            const requestedReturn = new Date(`${returnDate}T23:59:59`);

            const foundConflict = result.rows.find(row => {
                const bStart = new Date(row.pickup_date);
                const bEnd = new Date(row.return_date);
                return bStart <= requestedReturn && bEnd >= requestedPickup;
            });

            if (foundConflict) {
                isAvailable = false;
                conflict = {
                    id: foundConflict.id,
                    startDate: new Date(foundConflict.pickup_date).toISOString().split('T')[0],
                    endDate: new Date(foundConflict.return_date).toISOString().split('T')[0],
                };
            }
        }

        return NextResponse.json({
            success: true,
            carId,
            bookedRanges,
            isAvailable,
            conflict,
        });

    } catch (error) {
        console.error('Error fetching car availability:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la vérification de disponibilité', error: error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
