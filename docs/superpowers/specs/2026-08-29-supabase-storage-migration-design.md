# Specification: Migration from Cloudinary to Supabase Storage

**Date:** 2026-08-29  
**Status:** Approved  
**Topic:** Replace Cloudinary with Supabase Storage for Image Management  

---

## 1. Overview & Objectives

The goal is to completely remove Cloudinary from the project and replace it with Supabase Storage for handling image uploads (cars, categories, and general assets).

### Key Goals:
- Create a public Supabase Storage bucket named `images` with appropriate read/write policies.
- Remove all Cloudinary packages, environment variables, configuration files, and references.
- Create a unified storage service module (`src/lib/supabaseStorage.js`) using `@supabase/supabase-js`.
- Update the `/api/upload` API route to upload images directly to Supabase Storage and return public URLs.
- Ensure full backward-compatibility with existing frontend upload forms (`products/page.js`, `categories/page.js`).
- Clean up `next.config.js` and security documentation.

---

## 2. Architecture & Design

```
[ Admin Dashboard Form ]
        │  (multipart/form-data)
        ▼
[ Next.js API Route: /api/upload ]
        │
        ├─► 1. Verify Admin Session (Postgres session token)
        ├─► 2. Validate MIME Type & File Size
        └─► 3. Call `uploadImage(buffer, { folder, contentType, filename })`
                     │
                     ▼
        [ Supabase Storage Client: src/lib/supabaseStorage.js ]
                     │  (Uploads to bucket: "images")
                     ▼
        [ Supabase Storage Public Bucket: "images" ]
                     │
                     ▼
        [ Returns Public URL: https://<project>.supabase.co/storage/v1/object/public/images/... ]
```

---

## 3. Detailed Component Specifications

### 3.1 Supabase Storage Setup
- **Bucket Name:** `images`
- **Public Access:** `true` (Objects are accessible via direct URL without temporary signed tokens)
- **Allowed MIME Types:** `['image/jpeg', 'image/png', 'image/webp', 'image/gif']`
- **Storage Policies:**
  - `SELECT`: Public access for all users.
  - `INSERT` / `UPDATE` / `DELETE`: Managed server-side or via authenticated service key/policies.

### 3.2 Storage Library Module (`src/lib/supabaseStorage.js`)
- Initializes `@supabase/supabase-js` client using:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- **`uploadImage(buffer, options)`**:
  - Arguments:
    - `buffer`: Buffer or Uint8Array of the image.
    - `options.folder`: Subdirectory inside the bucket (default: `'cars'`).
    - `options.contentType`: MIME type of the file.
    - `options.fileName`: Optional specific file name.
  - Action: Uploads to Supabase Storage with `upsert: false`.
  - Returns: `{ url: string, path: string }`.
- **`deleteImage(path)`**:
  - Arguments: `path` string (file path within bucket).
  - Action: Deletes object from bucket.
  - Returns: `{ success: boolean, error?: any }`.

### 3.3 Upload API Route (`src/app/api/upload/route.js`)
- Authenticates caller using `verifyAdminSession()`.
- Validates file size (max 10MB) and allowed image MIME types.
- Calls `uploadImage()` from `src/lib/supabaseStorage.js`.
- Returns standardized JSON payload:
  ```json
  {
    "success": true,
    "message": "تم رفع الصورة بنجاح",
    "url": "https://legnjqukzdwrpoaiyeiz.supabase.co/storage/v1/object/public/images/cars/1724970000000-xyz.webp",
    "path": "cars/1724970000000-xyz.webp"
  }
  ```

### 3.4 Cleanup & Dependency Updates
- **File Deletions:**
  - Delete `src/lib/cloudinary.js`.
- **Package Management:**
  - Uninstall `cloudinary`.
  - Install `@supabase/supabase-js`.
- **Configuration Files:**
  - `next.config.js`: Remove `res.cloudinary.com` remotePattern (maintain `*.supabase.co`).
  - `.env`: Remove `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `DATABASE_SECURITY.md`: Replace Cloudinary secret documentation with Supabase Storage security guidelines.

---

## 4. Verification & Testing Strategy
1. **Supabase Bucket Verification:** Verify bucket exists in Supabase and has public read access.
2. **Package & Build Verification:** Run `npm run build` or `next build` to verify clean build without Cloudinary remnants.
3. **Integration Test:** Execute a test script to upload a test image buffer to Supabase Storage and verify public URL accessibility (HTTP 200).
4. **End-to-End Test:** Test the upload endpoint logic and verify response format matches expectations for admin product and category management.
