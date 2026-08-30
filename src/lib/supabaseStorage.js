import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://legnjqukzdwrpoaiyeiz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing for Supabase Storage');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'images';

/**
 * Optimize an image buffer using sharp
 * - Resize to max 1200px width (preserving aspect ratio)
 * - Convert to WebP at 80% quality
 * - Strip metadata (EXIF, etc.)
 * @param {Buffer} buffer - Raw image buffer
 * @returns {Promise<{ buffer: Buffer, contentType: string, ext: string }>}
 */
async function optimizeImage(buffer) {
    const optimized = await sharp(buffer)
        .resize(1200, 1200, {
            fit: 'inside',        // Keep aspect ratio, fit within 1200x1200
            withoutEnlargement: true, // Don't upscale small images
        })
        .webp({ quality: 80 })   // Convert to WebP at 80% quality
        .toBuffer();

    return {
        buffer: optimized,
        contentType: 'image/webp',
        ext: 'webp',
    };
}

/**
 * Upload an image buffer to Supabase Storage
 * Images are automatically optimized (resized + converted to WebP) before upload
 * @param {Buffer} buffer - The image buffer to upload
 * @param {Object} options - Upload options
 * @param {string} [options.folder='cars'] - Folder inside the bucket
 * @param {string} [options.contentType='image/jpeg'] - Original MIME type
 * @param {string} [options.fileName] - Optional custom file name
 * @param {boolean} [options.skipOptimization=false] - Skip image optimization
 * @returns {Promise<{ url: string, path: string }>} - Supabase upload result with public URL
 */
export async function uploadImage(buffer, options = {}) {
    const folder = options.folder || 'cars';
    let uploadBuffer = buffer;
    let contentType = options.contentType || 'image/jpeg';
    let ext;

    // Optimize unless explicitly skipped (e.g., for SVG/GIF)
    const skipOptimization = options.skipOptimization || 
        contentType === 'image/gif' || 
        contentType === 'image/svg+xml';

    if (!skipOptimization) {
        const optimized = await optimizeImage(buffer);
        uploadBuffer = optimized.buffer;
        contentType = optimized.contentType;
        ext = optimized.ext;
        console.log(`Image optimized: ${buffer.length} bytes → ${uploadBuffer.length} bytes (${Math.round((1 - uploadBuffer.length / buffer.length) * 100)}% reduction)`);
    } else {
        // Use original format
        if (contentType === 'image/png') ext = 'png';
        else if (contentType === 'image/webp') ext = 'webp';
        else if (contentType === 'image/gif') ext = 'gif';
        else if (contentType === 'image/svg+xml') ext = 'svg';
        else ext = 'jpg';
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileName = options.fileName || `${folder}/${timestamp}-${random}.${ext}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, uploadBuffer, {
            contentType,
            upsert: false,
        });

    if (error) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return {
        url: publicUrlData.publicUrl,
        path: data.path,
    };
}

/**
 * Delete an image from Supabase Storage by path
 * @param {string} filePath - The path of the image in the bucket
 * @returns {Promise<{ success: boolean, error?: any }>}
 */
export async function deleteImage(filePath) {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        return { success: false, error };
    }
    return { success: true };
}

export default supabase;
