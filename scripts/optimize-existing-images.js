/**
 * Optimize Existing Images Script
 * 
 * Downloads all car images from Supabase Storage, optimizes them with sharp
 * (resize to max 1200px, convert to WebP at 80% quality), re-uploads,
 * and updates the database URLs.
 * 
 * Usage: node scripts/optimize-existing-images.js
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const { Pool } = require('pg');

// Config from .env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://legnjqukzdwrpoaiyeiz.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ25qcXVremR3cnBvYWl5ZWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDQ5OTYsImV4cCI6MjA4NTc4MDk5Nn0.-liz3medssDKX1anSTmFWkXQLQ3kK-yNsxNxt6cywHY';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.legnjqukzdwrpoaiyeiz:QjWElmnZWsa5LztG@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

const BUCKET_NAME = 'images';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const pool = new Pool({ connectionString: DATABASE_URL });

async function optimizeImage(buffer) {
    return sharp(buffer)
        .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
}

function extractStoragePath(url) {
    // Extract the path after /object/public/images/
    const match = url.match(/\/object\/public\/images\/(.+)$/);
    return match ? match[1] : null;
}

async function main() {
    console.log('🔍 Fetching all car images from database...\n');

    const client = await pool.connect();

    try {
        // Get all image records
        const { rows: images } = await client.query(
            'SELECT id, car_id, image_url FROM car_images ORDER BY id'
        );

        console.log(`📸 Found ${images.length} images to optimize\n`);

        let totalOriginalSize = 0;
        let totalOptimizedSize = 0;
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        for (const img of images) {
            const storagePath = extractStoragePath(img.image_url);

            if (!storagePath) {
                console.log(`⚠️  [ID ${img.id}] Could not parse path from URL: ${img.image_url}`);
                errorCount++;
                continue;
            }

            // Skip already-optimized webp images
            if (storagePath.endsWith('.webp')) {
                console.log(`⏭️  [ID ${img.id}] Already WebP, skipping: ${storagePath}`);
                skippedCount++;
                continue;
            }

            try {
                // 1. Download original image
                console.log(`📥 [ID ${img.id}] Downloading: ${storagePath}`);
                const { data: downloadData, error: downloadError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .download(storagePath);

                if (downloadError) {
                    console.log(`❌ [ID ${img.id}] Download failed: ${downloadError.message}`);
                    errorCount++;
                    continue;
                }

                const originalBuffer = Buffer.from(await downloadData.arrayBuffer());
                const originalSize = originalBuffer.length;
                totalOriginalSize += originalSize;

                // 2. Optimize with sharp
                const optimizedBuffer = await optimizeImage(originalBuffer);
                const optimizedSize = optimizedBuffer.length;
                totalOptimizedSize += optimizedSize;

                const reduction = Math.round((1 - optimizedSize / originalSize) * 100);

                // 3. Generate new WebP path
                const newPath = storagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

                // 4. Delete the old file first (to avoid conflicts)
                await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([storagePath]);

                // 5. Upload optimized image (no upsert needed since we deleted)
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(newPath, optimizedBuffer, {
                        contentType: 'image/webp',
                        upsert: false,
                    });

                if (uploadError) {
                    console.log(`❌ [ID ${img.id}] Upload failed: ${uploadError.message}`);
                    errorCount++;
                    continue;
                }

                // 6. Get new public URL
                const { data: publicUrlData } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(newPath);

                const newUrl = publicUrlData.publicUrl;

                // 7. Update database record
                await client.query(
                    'UPDATE car_images SET image_url = $1 WHERE id = $2',
                    [newUrl, img.id]
                );

                console.log(`✅ [ID ${img.id}] ${(originalSize / 1024).toFixed(0)}KB → ${(optimizedSize / 1024).toFixed(0)}KB (${reduction}% reduction)`);
                successCount++;

            } catch (err) {
                console.log(`❌ [ID ${img.id}] Error: ${err.message}`);
                errorCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 OPTIMIZATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Optimized: ${successCount}`);
        console.log(`⏭️  Skipped:   ${skippedCount}`);
        console.log(`❌ Errors:    ${errorCount}`);
        console.log(`📦 Total original:  ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📦 Total optimized: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`💾 Space saved:     ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - totalOptimizedSize / totalOriginalSize) * 100)}%)`);
        console.log('='.repeat(60));

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
