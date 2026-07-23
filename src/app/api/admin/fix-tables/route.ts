import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

/**
 * Fix table names endpoint
 * This will drop the old Admin table and create correct AdminUser table
 * Visit: /api/admin/fix-tables
 */
export async function GET() {
  try {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      return NextResponse.json({
        success: false,
        error: 'Turso credentials not configured',
      }, { status: 500 });
    }

    console.log('🚀 Connecting to Turso...');
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    console.log('🗑️ Dropping old Admin table...');
    await client.execute('DROP TABLE IF EXISTS Admin');

    console.log('📋 Creating AdminUser table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "AdminUser" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "avatar" TEXT,
        "twoFactorEnabled" INTEGER NOT NULL DEFAULT 0,
        "lastLoginAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🌱 Seeding admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.execute({
      sql: `INSERT INTO AdminUser (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`,
      args: ['admin-1', 'admin@ariahub.com', hashedPassword, 'ARIA HUB Administrator', 'admin']
    });

    console.log('✅ Fix complete!');

    return NextResponse.json({
      success: true,
      message: 'Tables fixed successfully! ✅',
      data: {
        admin: { email: 'admin@ariahub.com' },
      },
      nextSteps: [
        '✅ AdminUser table created!',
        '1. Login: https://www.myariahub.com/admin',
        '2. Email: admin@ariahub.com',
        '3. Password: admin123',
        '4. Go to Auto Import tab',
        '5. Click "Run All Imports"',
      ]
    });

  } catch (error: any) {
    console.error('❌ Fix failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
