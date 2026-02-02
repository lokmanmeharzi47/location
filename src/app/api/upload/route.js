import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { uploadImage } from '@/lib/cloudinary';
import { cookies } from 'next/headers';

// Force Node.js runtime for file handling
export const runtime = 'nodejs';

/**
 * Verify admin session from cookie
 * @returns {Promise<Object|null>} User object if authenticated, null otherwise
 */
async function verifyAdminSession() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token) {
            return null;
        }

        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT u.id, u.email, u.name, u.role 
                 FROM sessions s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.token = $1 AND s.expires_at > NOW()
                 LIMIT 1`,
                [token]
            );

            const user = result.rows[0];
            if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
                return null;
            }

            return user;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Session verification error:', error);
        return null;
    }
}

export async function POST(request) {
    try {
        // 1. Verify admin authentication
        const admin = await verifyAdminSession();
        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'غير مصرح - يجب تسجيل الدخول كمسؤول' },
                { status: 401 }
            );
        }

        // 2. Parse form data
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'لم يتم تحديد ملف' },
                { status: 400 }
            );
        }

        // 3. Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: 'نوع الملف غير مدعوم. الأنواع المسموحة: JPG, PNG, WebP, GIF' },
                { status: 400 }
            );
        }

        // 4. Validate file size (max 10MB for Cloudinary)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, message: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' },
                { status: 400 }
            );
        }

        // 5. Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 6. Upload to Cloudinary (server-side only)
        const result = await uploadImage(buffer, {
            folder: 'boutique-rital',
        });

        // 7. Return ONLY the secure URL (no credentials exposed)
        return NextResponse.json({
            success: true,
            message: 'تم رفع الصورة بنجاح',
            url: result.secure_url,
            publicId: result.public_id,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في رفع الصورة', error: error.message },
            { status: 500 }
        );
    }
}
