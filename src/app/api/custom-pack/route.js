import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { sendCustomPackNotification } from '@/lib/telegram';

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
            pickup_date,
            return_date,
            total_days = 1,
            event_type = 'Mariage / Cortège',
            with_chauffeur = false,
            with_decoration = false,
            selected_cars = [],
            estimated_total = 0,
            notes = '',
        } = body;

        // Validation
        if (!customer_name || !customer_phone) {
            return NextResponse.json(
                { success: false, message: 'Le nom et le numéro de téléphone sont requis.' },
                { status: 400 }
            );
        }

        if (!selected_cars || selected_cars.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Veuillez sélectionner au moins un véhicule pour votre pack.' },
                { status: 400 }
            );
        }

        // Calculate combined daily rate
        const combinedDailyRate = selected_cars.reduce(
            (acc, car) => acc + (parseFloat(car.price) || 0),
            0
        );

        const primaryCarId = parseInt(selected_cars[0].id) || null;
        const carNamesList = selected_cars.map(c => c.name).join(', ');

        // Format detailed notes for admin order view
        const detailedNotes = [
            `👑 [PACK PERSONNALISÉ - ${selected_cars.length} VÉHICULES]`,
            `🎉 Événement: ${event_type}`,
            `🎩 Chauffeur: ${with_chauffeur ? 'Oui' : 'Non'}`,
            `💐 Décoration cortège: ${with_decoration ? 'Oui' : 'Non'}`,
            `🚗 Flotte: ${carNamesList}`,
            notes ? `📝 Remarques client: ${notes}` : null,
        ].filter(Boolean).join('\n');

        const extrasJson = JSON.stringify({
            is_custom_pack: true,
            event_type,
            with_chauffeur,
            with_decoration,
            selected_cars,
            estimated_total,
        });

        // Insert into bookings table
        const insertSql = `
            INSERT INTO bookings 
            (customer_name, customer_phone, customer_email, customer_address, customer_city, 
             car_id, pickup_date, return_date, pickup_location, return_location,
             daily_rate, total_days, subtotal, extras_amount, discount_amount, total_amount,
             notes, extras, payment_method, status, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        `;

        const result = await client.query(insertSql, [
            customer_name,
            customer_phone,
            customer_email || null,
            customer_address || 'Livraison pack personnalisé',
            customer_city || null,
            primaryCarId,
            pickup_date ? new Date(pickup_date) : null,
            return_date ? new Date(return_date) : null,
            'Livraison personnalisée',
            'Récupération personnalisée',
            combinedDailyRate,
            parseInt(total_days) || 1,
            parseFloat(estimated_total) || 0,
            0,
            0,
            parseFloat(estimated_total) || 0,
            detailedNotes,
            extrasJson,
            'espece',
            'قيد التنفيذ'
        ]);

        const newBookingId = result.rows[0]?.id;

        // Price formatting helper for Millions
        const formatPriceHelper = (p) => {
            const num = Number(p || 0);
            const val = num > 100 ? (num / 10000) : num;
            const formatted = val.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
            return `${formatted} ${val > 1 ? 'Millions' : 'Million'}`;
        };

        const displayTotal = body.formatted_total || formatPriceHelper(estimated_total);

        // Dispatch Telegram Notification
        try {
            await sendCustomPackNotification({
                id: newBookingId,
                customer_name,
                customer_phone,
                customer_city,
                pickup_date,
                return_date,
                total_days,
                event_type,
                with_chauffeur,
                with_decoration,
                selected_cars,
                estimated_total,
                formatted_total: displayTotal,
                notes,
            });
        } catch (telegramErr) {
            console.error('Custom pack Telegram notification error:', telegramErr);
        }

        // WhatsApp message generation
        const waCarsText = selected_cars.map(c => `• ${c.name} (${c.formatted_price || formatPriceHelper(c.price)}/j)`).join('\n');
        const waMessage = [
            `👑 *Demande de Pack Personnalisé - Luxury Location* 👑`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `👤 *Nom :* ${customer_name}`,
            `📞 *Téléphone :* ${customer_phone}`,
            `📍 *Wilaya :* ${customer_city || 'Non précisée'}`,
            `🎉 *Événement :* ${event_type}`,
            ``,
            `🚗 *Véhicules sélectionnés (${selected_cars.length}) :*`,
            waCarsText,
            ``,
            `🎩 *Chauffeur :* ${with_chauffeur ? 'Oui ✅' : 'Sans chauffeur ❌'}`,
            `💐 *Décoration cortège :* ${with_decoration ? 'Oui (Fleurs & Rubans) ✅' : 'Non ❌'}`,
            ``,
            `📅 *Dates :* Du ${pickup_date || 'A définir'} au ${return_date || 'A définir'} (${total_days || 1} jours)`,
            `💰 *Estimation indicative :* ${displayTotal}`,
            ...(notes ? [``, `📝 *Remarques :* ${notes}`] : []),
            `━━━━━━━━━━━━━━━━━━━━`,
            `Bonjour, je souhaite obtenir un devis personnalisé et réserver ce pack.`,
        ].join('\n');

        const whatsappUrl = `https://wa.me/213778612190?text=${encodeURIComponent(waMessage)}`;

        return NextResponse.json({
            success: true,
            booking_id: newBookingId,
            whatsapp_url: whatsappUrl,
            message: 'Pack personnalisé enregistré avec succès !',
        });

    } catch (error) {
        console.error('Custom pack error:', error);
        return NextResponse.json(
            { success: false, message: 'Une erreur est survenue lors de l\'enregistrement de votre pack.', error: error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
