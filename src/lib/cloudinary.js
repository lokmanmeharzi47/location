import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with server-side environment variables
// These credentials are NEVER exposed to the client
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - The image buffer to upload
 * @param {Object} options - Upload options (folder, public_id, etc.)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export async function uploadImage(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: options.folder || 'boutique-rital',
            resource_type: 'image',
            ...options,
        };

        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        }).end(buffer);
    });
}

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export async function deleteImage(publicId) {
    return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
