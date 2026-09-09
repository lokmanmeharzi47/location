import { getDictionary } from "@/lib/dictionaries";
import { query } from "@/lib/db";
import CustomPackClient from "./CustomPackClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return {
        title: `${dict?.custom_pack?.title || "Pack Personnalisé"} | Luxury Location Algérie`,
        description: dict?.custom_pack?.subtitle || "Location de plusieurs voitures pour mariages, cortèges et événements VIP en Algérie.",
    };
}

export default async function CustomPackPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    let cars = [];
    try {
        const sql = `
            SELECT 
                c.id,
                c.name,
                c.price_per_day,
                c.transmission,
                c.category_id,
                c.display_order,
                cat.name as category_name,
                (
                    SELECT image_url 
                    FROM car_images 
                    WHERE car_id = c.id 
                    ORDER BY is_primary DESC, display_order ASC 
                    LIMIT 1
                ) as image_url
            FROM cars c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.status = 'disponible'
            ORDER BY COALESCE(c.display_order, 0) ASC, LOWER(TRIM(c.name)) ASC
        `;
        const rows = await query(sql, []);
        cars = rows.map(car => ({
            id: car.id,
            name: car.name,
            price: parseFloat(car.price_per_day) || 0,
            transmission: car.transmission || 'Automatique',
            category: car.category_name || 'VIP',
            categoryId: car.category_id,
            image: car.image_url || '/images/placeholder.jpg',
        }));
    } catch (e) {
        console.error('Error fetching cars for custom pack:', e);
    }

    return <CustomPackClient initialCars={cars} dict={dict} lang={lang} />;
}
