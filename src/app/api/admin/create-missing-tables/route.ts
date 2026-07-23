import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

/**
 * Create ALL missing tables that Prisma expects
 * This creates tables that don't exist yet
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

    console.log('🚀 Creating missing tables...');
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    // Create all missing tables
    const migrations = [
      `CREATE TABLE IF NOT EXISTS "Language" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "nativeName" TEXT NOT NULL,
        "direction" TEXT NOT NULL DEFAULT 'ltr',
        "enabled" INTEGER NOT NULL DEFAULT 1,
        "isDefault" INTEGER NOT NULL DEFAULT 0,
        "flag" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "translations" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "MenuItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "label" TEXT NOT NULL,
        "labelI18n" TEXT,
        "url" TEXT,
        "parentId" TEXT,
        "icon" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "visible" INTEGER NOT NULL DEFAULT 1,
        "openInNewTab" INTEGER NOT NULL DEFAULT 0,
        "pageSlug" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "Section" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "subtitle" TEXT,
        "enabled" INTEGER NOT NULL DEFAULT 1,
        "order" INTEGER NOT NULL DEFAULT 0,
        "config" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "ServiceCategory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "icon" TEXT,
        "description" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Visa" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "country" TEXT NOT NULL,
        "countryI18n" TEXT,
        "countryCode" TEXT,
        "visaType" TEXT NOT NULL,
        "visaTypeI18n" TEXT,
        "slug" TEXT NOT NULL UNIQUE,
        "duration" TEXT,
        "processingTime" TEXT,
        "fee" TEXT,
        "requirements" TEXT,
        "requirementsI18n" TEXT,
        "documents" TEXT,
        "documentsI18n" TEXT,
        "eligibility" TEXT,
        "eligibilityI18n" TEXT,
        "embassyDetails" TEXT,
        "applicationProcess" TEXT,
        "applicationProcessI18n" TEXT,
        "faqs" TEXT,
        "image" TEXT,
        "gallery" TEXT,
        "featured" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'published',
        "sort" INTEGER NOT NULL DEFAULT 0,
        "seoTitle" TEXT,
        "seoDescription" TEXT,
        "description" TEXT,
        "descriptionI18n" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "ImportRun" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sourceId" TEXT NOT NULL,
        "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "finishedAt" DATETIME,
        "status" TEXT NOT NULL DEFAULT 'running',
        "found" INTEGER NOT NULL DEFAULT 0,
        "imported" INTEGER NOT NULL DEFAULT 0,
        "updated" INTEGER NOT NULL DEFAULT 0,
        "skipped" INTEGER NOT NULL DEFAULT 0,
        "duplicates" INTEGER NOT NULL DEFAULT 0,
        "failed" INTEGER NOT NULL DEFAULT 0,
        "processingMs" INTEGER NOT NULL DEFAULT 0,
        "errors" TEXT,
        "triggeredBy" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("sourceId") REFERENCES "ImportSource"("id") ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "GalleryAlbum" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "coverImage" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "GalleryItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'image',
        "url" TEXT NOT NULL,
        "thumbnail" TEXT,
        "caption" TEXT,
        "category" TEXT,
        "albumId" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "PaymentMethod" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "logo" TEXT,
        "qrCode" TEXT,
        "accountNumber" TEXT,
        "iban" TEXT,
        "accountTitle" TEXT,
        "description" TEXT,
        "instructions" TEXT,
        "status" TEXT NOT NULL DEFAULT 'active',
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Testimonial" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "nameI18n" TEXT,
        "role" TEXT,
        "roleI18n" TEXT,
        "company" TEXT,
        "companyI18n" TEXT,
        "avatar" TEXT,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "content" TEXT NOT NULL,
        "contentI18n" TEXT,
        "featured" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'published',
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Partner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logo" TEXT,
        "website" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'active',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Counter" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "label" TEXT NOT NULL,
        "value" INTEGER NOT NULL,
        "suffix" TEXT,
        "icon" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Faq" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "question" TEXT NOT NULL,
        "questionI18n" TEXT,
        "answer" TEXT NOT NULL,
        "answerI18n" TEXT,
        "category" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'published',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "NewsCategory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "News" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "titleI18n" TEXT,
        "slug" TEXT NOT NULL UNIQUE,
        "excerpt" TEXT NOT NULL,
        "excerptI18n" TEXT,
        "content" TEXT NOT NULL,
        "contentI18n" TEXT,
        "image" TEXT,
        "author" TEXT,
        "tags" TEXT,
        "featured" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'published',
        "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "seoTitle" TEXT,
        "seoDescription" TEXT,
        "categoryId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("categoryId") REFERENCES "NewsCategory"("id") ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "SocialLink" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "platform" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "icon" TEXT,
        "color" TEXT,
        "enabled" INTEGER NOT NULL DEFAULT 1,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "FooterLink" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "column" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "ContactMessage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "subject" TEXT,
        "message" TEXT NOT NULL,
        "department" TEXT,
        "status" TEXT NOT NULL DEFAULT 'new',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Department" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "phone" TEXT,
        "description" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Branch" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "phone" TEXT,
        "email" TEXT,
        "hours" TEXT,
        "isMain" INTEGER NOT NULL DEFAULT 0,
        "mapEmbed" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Advertisement" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "company" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "image" TEXT,
        "video" TEXT,
        "website" TEXT,
        "package" TEXT,
        "startDate" TEXT,
        "endDate" TEXT,
        "views" INTEGER NOT NULL DEFAULT 0,
        "clicks" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Subscriber" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "status" TEXT NOT NULL DEFAULT 'active',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "entity" TEXT,
        "entityId" TEXT,
        "details" TEXT,
        "ip" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "Visit" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "path" TEXT NOT NULL,
        "country" TEXT,
        "city" TEXT,
        "browser" TEXT,
        "device" TEXT,
        "referrer" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "ProcessStep" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "titleI18n" TEXT,
        "description" TEXT NOT NULL,
        "descriptionI18n" TEXT,
        "icon" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'published',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "PricingPackage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "nameI18n" TEXT,
        "slug" TEXT NOT NULL UNIQUE,
        "price" TEXT NOT NULL,
        "period" TEXT NOT NULL DEFAULT 'one-time',
        "description" TEXT,
        "descriptionI18n" TEXT,
        "features" TEXT,
        "featuresI18n" TEXT,
        "icon" TEXT,
        "featured" INTEGER NOT NULL DEFAULT 0,
        "badge" TEXT,
        "ctaLabel" TEXT NOT NULL DEFAULT 'Get Started',
        "ctaUrl" TEXT NOT NULL DEFAULT '#contact',
        "order" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'published',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "TeamMember" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "nameI18n" TEXT,
        "role" TEXT NOT NULL,
        "roleI18n" TEXT,
        "bio" TEXT,
        "bioI18n" TEXT,
        "photo" TEXT,
        "email" TEXT,
        "linkedin" TEXT,
        "twitter" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "featured" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'published',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "ComparisonRow" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "feature" TEXT NOT NULL,
        "ariaValue" TEXT NOT NULL DEFAULT '✓',
        "othersValue" TEXT NOT NULL DEFAULT '—',
        "order" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'published',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    // Execute all migrations
    for (const migration of migrations) {
      await client.execute(migration);
    }

    console.log('✅ All missing tables created!');

    return NextResponse.json({
      success: true,
      message: 'All missing tables created successfully! ✅',
      tablesCreated: migrations.length,
      nextSteps: [
        '✅ Database schema is now complete!',
        '1. Refresh the admin panel',
        '2. All panels should load without errors now',
        '3. Go to Auto Import tab',
        '4. Click "Run All Imports"',
      ]
    });

  } catch (error: any) {
    console.error('❌ Table creation failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
