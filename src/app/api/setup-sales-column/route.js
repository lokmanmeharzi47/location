import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Check if column exists
        const checkSql = `
      SELECT count(*) as count 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'sales' 
      AND table_schema = current_database()
    `;
        const checkResult = await query(checkSql);

        if (checkResult[0].count > 0) {
            return NextResponse.json({ message: 'Column sales already exists' });
        }

        // Add column
        const alterSql = `ALTER TABLE products ADD COLUMN sales INT DEFAULT 0`;
        await query(alterSql);

        // Also add index for performance
        try {
            await query(`CREATE INDEX idx_products_sales ON products(sales)`);
        } catch {
            // Index might already exist or skipped
        }

        return NextResponse.json({ success: true, message: 'Added sales column to products table' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
