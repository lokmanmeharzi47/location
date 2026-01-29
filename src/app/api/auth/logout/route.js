import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        // Remove session from database
        if (token) {
            try {
                await query('DELETE FROM sessions WHERE token = ?', [token]);
            } catch (error) {
                // Session table might not exist, continue anyway
                console.log('Session deletion skipped:', error.message);
            }
        }

        // Clear cookie
        const response = NextResponse.json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });

        response.cookies.delete('admin_token');

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في تسجيل الخروج' },
            { status: 500 }
        );
    }
}
