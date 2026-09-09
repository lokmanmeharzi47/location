import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://legnjqukzdwrpoaiyeiz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    console.log('=== Step 1: Uploading Pack Personnalisé image to Supabase Storage ===');
    const imagePath = path.join(process.cwd(), 'public', 'images', 'custom-pack-fleet.jpg');
    
    if (!fs.existsSync(imagePath)) {
        throw new Error('Image not found: ' + imagePath);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = `categories/pack-personnalise-${Date.now()}.jpg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (uploadError) {
        throw new Error('Supabase Storage Upload Error: ' + uploadError.message);
    }

    const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('Successfully uploaded image to Supabase Storage!');
    console.log('Public URL:', publicUrl);

    console.log('\n=== Step 2: Updating Category in PostgreSQL database ===');
    const client = await pool.connect();
    try {
        // Check if category exists
        const existing = await client.query(`SELECT id, name, slug, image_path FROM categories WHERE id = 7 OR slug = 'pack-personnalise' OR name ILIKE '%pack%'`);
        console.log('Found existing category candidates:', existing.rows);

        let categoryId;
        if (existing.rows.length > 0) {
            categoryId = existing.rows[0].id;
            await client.query(`
                UPDATE categories
                SET name = $1,
                    slug = $2,
                    description = $3,
                    image_path = $4,
                    href = $5,
                    display_order = $6,
                    is_active = $7,
                    updated_at = NOW()
                WHERE id = $8
            `, [
                'Pack Personnalisé',
                'pack-personnalise',
                'Composez votre cortège et flotte VIP sur-mesure pour mariages, délégations et événements.',
                publicUrl,
                '/pack-personnalise',
                1,
                true,
                categoryId
            ]);
            console.log(`Updated existing category ID ${categoryId} to 'Pack Personnalisé' with href '/pack-personnalise' and public image URL.`);
        } else {
            const insertResult = await client.query(`
                INSERT INTO categories (name, slug, description, image_path, href, display_order, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                RETURNING id
            `, [
                'Pack Personnalisé',
                'pack-personnalise',
                'Composez votre cortège et flotte VIP sur-mesure pour mariages, délégations et événements.',
                publicUrl,
                '/pack-personnalise',
                1,
                true
            ]);
            categoryId = insertResult.rows[0].id;
            console.log(`Created new category ID ${categoryId}.`);
        }

        const allCategories = await client.query(`SELECT id, name, slug, image_path, href, display_order, is_active FROM categories ORDER BY display_order ASC, id ASC`);
        console.log('\nCurrent categories in DB:');
        console.table(allCategories.rows);

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
