import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://legnjqukzdwrpoaiyeiz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing for Supabase Storage');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'images';

/**
 * Upload an image buffer to Supabase Storage
 * @param {Buffer} buffer - The image buffer to upload
 * @param {Object} options - Upload options
 * @param {string} [options.folder='cars'] - Folder inside the bucket
 * @param {string} [options.contentType='image/jpeg'] - MIME type
 * @param {string} [options.fileName] - Optional custom file name
 * @returns {Promise<{ url: string, path: string }>} - Supabase upload result with public URL
 */
export async function uploadImage(buffer, options = {}) {
    const folder = options.folder || 'cars';
    const contentType = options.contentType || 'image/jpeg';
    
    // Determine extension from content-type or default to jpg
    let ext = 'jpg';
    if (contentType === 'image/png') ext = 'png';
    else if (contentType === 'image/webp') ext = 'webp';
    else if (contentType === 'image/gif') ext = 'gif';
    else if (contentType === 'image/svg+xml') ext = 'svg';

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileName = options.fileName || `${folder}/${timestamp}-${random}.${ext}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
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
