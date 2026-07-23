import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

/**
 * Migration + Seed endpoint
 * This will create all tables and seed initial data
 * Visit: /api/admin/migrate
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

    // Check if tables already exist
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables.rows.map((r: any) => r.name);
    
    if (tableNames.length > 5) {
      return NextResponse.json({
        success: true,
        message: 'Database already migrated!',
        tables: tableNames,
      });
    }

    console.log('📋 Creating tables...');

    // Create all tables in order (respecting foreign keys)
    const migrations = [
      // Admin table
      `CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // SiteSetting table
      `CREATE TABLE IF NOT EXISTS "SiteSetting" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "siteName" TEXT NOT NULL,
        "tagline" TEXT,
        "description" TEXT,
        "logo" TEXT,
        "favicon" TEXT,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // OpportunityCategory table
      `CREATE TABLE IF NOT EXISTS "OpportunityCategory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "slug" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "nameI18n" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // ImportSource table
      `CREATE TABLE IF NOT EXISTS "ImportSource" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "scraperKey" TEXT NOT NULL,
        "baseUrl" TEXT NOT NULL,
        "enabled" INTEGER NOT NULL DEFAULT 1,
        "autoPublish" INTEGER NOT NULL DEFAULT 1,
        "scheduleMinutes" INTEGER NOT NULL DEFAULT 360,
        "lastImportAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Opportunity table
      `CREATE TABLE IF NOT EXISTS "Opportunity" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "content" TEXT,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "featured" INTEGER NOT NULL DEFAULT 0,
        "featuredImage" TEXT,
        "deadline" DATETIME,
        "location" TEXT,
        "salary" TEXT,
        "organizationName" TEXT,
        "organizationLogo" TEXT,
        "applyUrl" TEXT,
        "categoryId" TEXT,
        "sourceUrl" TEXT,
        "importSourceId" TEXT,
        "importedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("categoryId") REFERENCES "OpportunityCategory"("id") ON DELETE SET NULL,
        FOREIGN KEY ("importSourceId") REFERENCES "ImportSource"("id") ON DELETE SET NULL
      )`,

      // ImportLog table
      `CREATE TABLE IF NOT EXISTS "ImportLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sourceId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "itemsScraped" INTEGER NOT NULL DEFAULT 0,
        "itemsImported" INTEGER NOT NULL DEFAULT 0,
        "itemsSkipped" INTEGER NOT NULL DEFAULT 0,
        "errors" TEXT,
        "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" DATETIME,
        FOREIGN KEY ("sourceId") REFERENCES "ImportSource"("id") ON DELETE CASCADE
      )`,

      // Additional tables for completeness
      `CREATE TABLE IF NOT EXISTS "CtaBanner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "subtitle" TEXT,
        "buttonText" TEXT,
        "buttonUrl" TEXT,
        "isActive" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "NewsPost" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "excerpt" TEXT,
        "content" TEXT,
        "featuredImage" TEXT,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Service" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "icon" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    // Execute migrations
    for (const migration of migrations) {
      await client.execute(migration);
    }

    console.log('✅ Tables created!');
    console.log('🌱 Seeding initial data...');

    // Seed admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.execute({
      sql: `INSERT INTO Admin (id, email, password, fullName) VALUES (?, ?, ?, ?)`,
      args: ['admin-1', 'admin@ariahub.com', hashedPassword, 'ARIA HUB Administrator']
    });

    // Seed site settings
    await client.execute({
      sql: `INSERT INTO SiteSetting (id, siteName, tagline, description) VALUES (?, ?, ?, ?)`,
      args: ['default', 'ARIA HUB', 'Professional Business Services Platform', 'Premium business, visa and opportunity services.']
    });

    // Seed categories
    const categories = [
      { id: 'cat-1', slug: 'it-technology', name: 'IT & Technology', nameI18n: JSON.stringify({ en: 'IT & Technology', fa: 'فناوری اطلاعات', ps: 'معلوماتي ټکنالوژي' }) },
      { id: 'cat-2', slug: 'healthcare', name: 'Healthcare', nameI18n: JSON.stringify({ en: 'Healthcare', fa: 'مراقبت‌های بهداشتی', ps: 'روغتیا پاملرنه' }) },
      { id: 'cat-3', slug: 'education', name: 'Education', nameI18n: JSON.stringify({ en: 'Education', fa: 'آموزش', ps: 'زده کړه' }) },
      { id: 'cat-4', slug: 'business', name: 'Business', nameI18n: JSON.stringify({ en: 'Business', fa: 'کسب و کار', ps: 'سوداګرۍ' }) },
      { id: 'cat-5', slug: 'other', name: 'Other', nameI18n: JSON.stringify({ en: 'Other', fa: 'سایر', ps: 'نور' }) },
    ];

    for (const cat of categories) {
      await client.execute({
        sql: `INSERT INTO OpportunityCategory (id, slug, name, nameI18n) VALUES (?, ?, ?, ?)`,
        args: [cat.id, cat.slug, cat.name, cat.nameI18n]
      });
    }

    // Seed import sources
    await client.execute({
      sql: `INSERT INTO ImportSource (id, name, type, scraperKey, baseUrl, enabled, autoPublish, scheduleMinutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['source-1', 'Wazifaha Jobs', 'job', 'wazifaha', 'https://wazifaha.org', 1, 1, 360]
    });

    await client.execute({
      sql: `INSERT INTO ImportSource (id, name, type, scraperKey, baseUrl, enabled, autoPublish, scheduleMinutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['source-2', 'Scholarships.af', 'scholarship', 'scholarshipsAf', 'https://scholarships.af', 1, 1, 360]
    });

    console.log('✅ Seed complete!');

    return NextResponse.json({
      success: true,
      message: 'Database migrated and seeded successfully! ✅',
      data: {
        admin: { email: 'admin@ariahub.com' },
        categoriesCreated: categories.length,
        importSourcesCreated: 2,
      },
      nextSteps: [
        '✅ Database ready!',
        '1. Login: https://www.myariahub.com/admin',
        '2. Email: admin@ariahub.com',
        '3. Password: admin123',
        '4. Go to Auto Import tab',
        '5. Click "Run All Imports"',
      ]
    });

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
