const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://legnjqukzdwrpoaiyeiz.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ25qcXVremR3cnBvYWl5ZWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDQ5OTYsImV4cCI6MjA4NTc4MDk5Nn0.-liz3medssDKX1anSTmFWkXQLQ3kK-yNsxNxt6cywHY';
const BUCKET_NAME = 'images';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadHeroBg() {
    const filePath = path.join(__dirname, '..', 'public', 'images', 'hero-bg.avif');
    console.log('Reading file from:', filePath);

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    const fileBuffer = fs.readFileSync(filePath);
    console.log(`File size: ${fileBuffer.length} bytes`);

    const storagePath = 'hero/hero-bg.avif';

    // Upload with upsert: true
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
            contentType: 'image/avif',
            upsert: true,
        });

    if (error) {
        console.error('Supabase upload error:', error);
        process.exit(1);
    }

    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

    console.log('Upload successful!');
    console.log('Path:', data.path);
    console.log('Public URL:', publicUrlData.publicUrl);
}

uploadHeroBg();
