# Supabase Storage Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely remove Cloudinary and replace it with Supabase Storage for all image management.

**Architecture:** Create and configure a public Supabase Storage bucket (`images`). Replace Cloudinary utility with a server-side `@supabase/supabase-js` storage module (`src/lib/supabaseStorage.js`) that handles uploads and returns public URLs. Update `/api/upload` route handler to use this module while keeping existing admin authentication and UI API contracts intact.

**Tech Stack:** Next.js 16 (App Router), `@supabase/supabase-js`, PostgreSQL / Supabase Storage.

## Global Constraints
- Bucket name: `images`
- Storage URL format: `https://<supabase-ref>.supabase.co/storage/v1/object/public/images/<folder>/<filename>`
- Zero broken interfaces for existing product/category forms.
- All Cloudinary code, credentials, and dependencies must be cleanly purged.

---

### Task 1: Supabase Bucket Setup & Storage Policies

**Files:**
- Database: `storage.buckets`, `storage.objects`

**Interfaces:**
- Produces: Public Supabase bucket named `images` accessible at `https://legnjqukzdwrpoaiyeiz.supabase.co/storage/v1/object/public/images/`

- [ ] **Step 1: Create the public storage bucket in Supabase**
Run SQL query via Supabase MCP:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images',
    'images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, 
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
```

- [ ] **Step 2: Add storage RLS policies for public select and authorized insert**
Run SQL query via Supabase MCP:
```sql
DO $$
BEGIN
    -- Public read policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Images'
    ) THEN
        CREATE POLICY "Public Access Images" ON storage.objects
        FOR SELECT USING (bucket_id = 'images');
    END IF;

    -- Allow insert policy for public / anon uploads
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Uploads Images'
    ) THEN
        CREATE POLICY "Allow Uploads Images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'images');
    END IF;
END $$;
```

- [ ] **Step 3: Verify bucket exists and is public**
Run verification query:
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'images';
```

---

### Task 2: Dependency Management & Environment Configuration

**Files:**
- Modify: `package.json`
- Modify: `.env`

- [ ] **Step 1: Uninstall `cloudinary` and install `@supabase/supabase-js`**
Run:
```bash
npm uninstall cloudinary
npm install @supabase/supabase-js
```

- [ ] **Step 2: Update `.env` file**
Remove:
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
Add:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ25qcXVremR3cnBvYWl5ZWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDQ5OTYsImV4cCI6MjA4NTc4MDk5Nn0.-liz3medssDKX1anSTmFWkXQLQ3kK-yNsxNxt6cywHY
```

---

### Task 3: Implement Supabase Storage Service & Delete Cloudinary Service

**Files:**
- Create: `src/lib/supabaseStorage.js`
- Delete: `src/lib/cloudinary.js`

**Interfaces:**
- Produces: `uploadImage(buffer, options)` -> `Promise<{ url: string, path: string }>`
- Produces: `deleteImage(path)` -> `Promise<{ success: boolean }>`

- [ ] **Step 1: Create `src/lib/supabaseStorage.js`**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://legnjqukzdwrpoaiyeiz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key missing for Supabase Storage');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'images';

/**
 * Upload an image buffer to Supabase Storage
 * @param {Buffer} buffer - The image buffer to upload
 * @param {Object} options - Upload options
 * @param {string} [options.folder='cars'] - Folder inside the bucket
 * @param {string} [options.contentType='image/webp'] - MIME type
 * @param {string} [options.fileName] - Optional custom filename
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadImage(buffer, options = {}) {
    const folder = options.folder || 'cars';
    const contentType = options.contentType || 'image/jpeg';
    
    // Generate unique filename if not provided
    const ext = contentType.split('/')[1] || 'jpg';
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
 * Delete an image from Supabase Storage
 * @param {string} filePath - Path of file in the bucket (e.g. "cars/123-abc.webp")
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
```

- [ ] **Step 2: Delete `src/lib/cloudinary.js`**

---

### Task 4: Update Upload API Route

**Files:**
- Modify: `src/app/api/upload/route.js`

- [ ] **Step 1: Update `src/app/api/upload/route.js`**
Update imports and upload call:
```javascript
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { uploadImage } from '@/lib/supabaseStorage';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

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
        const folder = formData.get('folder') || 'cars';

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

        // 4. Validate file size (max 10MB)
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

        // 6. Upload to Supabase Storage
        const result = await uploadImage(buffer, {
            folder,
            contentType: file.type,
        });

        // 7. Return the public URL
        return NextResponse.json({
            success: true,
            message: 'تم رفع الصورة بنجاح',
            url: result.url,
            path: result.path,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'حدث خطأ في رفع الصورة', error: error.message },
            { status: 500 }
        );
    }
}
```

---

### Task 5: Config & Documentation Cleanup

**Files:**
- Modify: `next.config.js`
- Modify: `DATABASE_SECURITY.md`

- [ ] **Step 1: Clean up `next.config.js`**
Remove `res.cloudinary.com` remotePattern.

- [ ] **Step 2: Clean up `DATABASE_SECURITY.md`**
Remove Cloudinary references and document Supabase Storage keys.

---

### Task 6: Verification & End-to-End Testing

- [ ] **Step 1: Test Supabase Storage upload with a test script**
Create temporary test script `scripts/test-storage-upload.js` and verify upload + HTTP fetch of public URL.
- [ ] **Step 2: Clean up temporary test script**
- [ ] **Step 3: Run Next.js build check**
Run `npm run build` to verify there are no compilation errors or missing imports.
