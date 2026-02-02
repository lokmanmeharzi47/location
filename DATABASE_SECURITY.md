# Database Security Guide

This guide covers security best practices for your Supabase PostgreSQL database.

## Row Level Security (RLS)

Supabase uses PostgreSQL's Row Level Security to control data access. While your Next.js API routes handle authentication, enabling RLS adds an extra layer of protection.

### Enable RLS on Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

### Recommended Policies

Since your app uses server-side authentication (not Supabase Auth), create policies that allow your service role full access:

```sql
-- Allow all operations for authenticated service role
-- Categories: Public read, admin write
CREATE POLICY "Public read categories" ON categories
    FOR SELECT USING (true);

-- Products: Public read, admin write  
CREATE POLICY "Public read products" ON products
    FOR SELECT USING (true);

-- Orders: Service role only (handled by API)
CREATE POLICY "Service role orders" ON orders
    FOR ALL USING (true);
```

## Environment Variable Security

| Variable | Exposure | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Server only | Never prefix with `NEXT_PUBLIC_` |
| `CLOUDINARY_API_SECRET` | Server only | Never prefix with `NEXT_PUBLIC_` |
| `CLOUDINARY_CLOUD_NAME` | Server only | Safe but not needed on client |

## API Route Protection

Always verify admin sessions in protected routes:

```javascript
// Example: Protected API route
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    if (!token) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session in database
    const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
    });
    
    if (!session || session.expiresAt < new Date() || session.user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Proceed with protected operation...
}
```

## Best Practices Checklist

- [ ] Enable RLS on all tables in Supabase
- [ ] Never expose `DATABASE_URL` to the client
- [ ] Always validate user sessions in API routes
- [ ] Use parameterized queries (Prisma handles this)
- [ ] Regularly rotate database passwords
- [ ] Monitor database logs for suspicious activity
