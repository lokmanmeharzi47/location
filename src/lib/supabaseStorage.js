import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://legnjqukzdwrpoaiyeiz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing for Supabase Storage');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'images';

/**
 * Lazily load sharp — it may not be available on all platforms (e.g. serverless)
 */
let _sharp = undefined; // undefined = not yet attempted, null = failed
async function getSharp() {
    if (_sharp === undefined) {
        try {
            _sharp = (await import('sharp')).default;
        } catch (e) {
            console.warn('sharp is not available, image optimization will be skipped:', e.message);
            _sharp = null;
        }
    }
    return _sharp;
}

/**
 * Optimize an image buffer using sharp
 * - Resize to max 1200px width (preserving aspect ratio)
 * - Convert to WebP at 80% quality
 * - Strip metadata (EXIF, etc.)
 * @param {Buffer} buffer - Raw image buffer
 * @returns {Promise<{ buffer: Buffer, contentType: string, ext: string } | null>}
 */
async function optimizeImage(buffer) {
    const sharp = await getSharp();
    if (!sharp) {
        return null; // sharp not available
    }

    try {
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
    } catch (err) {
        console.warn('Image optimization failed, using original:', err.message);
        return null; // Optimization failed, caller will use original
    }
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
        if (optimized) {
            uploadBuffer = optimized.buffer;
            contentType = optimized.contentType;
            ext = optimized.ext;
            console.log(`Image optimized: ${buffer.length} bytes → ${uploadBuffer.length} bytes (${Math.round((1 - uploadBuffer.length / buffer.length) * 100)}% reduction)`);
        } else {
            // Optimization failed or sharp not available — use original
            console.log('Using original image without optimization');
            ext = getExtFromContentType(contentType);
        }
    } else {
        // Use original format
        ext = getExtFromContentType(contentType);
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileName = options.fileName || `${folder}/${timestamp}-${random}.${ext}`;

    console.log('Uploading to Supabase Storage:', { fileName, contentType, size: uploadBuffer.length });

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, uploadBuffer, {
            contentType,
            upsert: false,
        });

    if (error) {
        console.error('Supabase Storage upload error:', error);
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
 * Get file extension from MIME content type
 * @param {string} contentType - MIME type
 * @returns {string} file extension
 */
function getExtFromContentType(contentType) {
    if (contentType === 'image/png') return 'png';
    if (contentType === 'image/webp') return 'webp';
    if (contentType === 'image/gif') return 'gif';
    if (contentType === 'image/svg+xml') return 'svg';
    return 'jpg';
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
