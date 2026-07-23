import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

/**
 * Debug endpoint to check database schema
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

    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    // Get all tables
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const tableNames = tables.rows.map((r: any) => r.name);

    // Get schema for each table
    const schemas: any = {};
    for (const tableName of tableNames) {
      const schema = await client.execute(`PRAGMA table_info("${tableName}")`);
      schemas[tableName] = schema.rows.map((r: any) => ({
        name: r.name,
        type: r.type,
        notNull: r.notnull === 1,
        pk: r.pk === 1,
      }));
    }

    // Count rows in each table
    const counts: any = {};
    for (const tableName of tableNames) {
      try {
        const count = await client.execute(`SELECT COUNT(*) as count FROM "${tableName}"`);
        counts[tableName] = count.rows[0]?.count || 0;
      } catch (e) {
        counts[tableName] = 'error';
      }
    }

    return NextResponse.json({
      success: true,
      tables: tableNames,
      schemas,
      counts,
      prismaExpects: [
        'SiteSetting',
        'Language', 
        'MenuItem',
        'Section',
        'ServiceCategory',
        'Service',
        'Visa',
        'OpportunityCategory',
        'Opportunity',
        'ImportSource',
        'ImportRun',
        'GalleryAlbum',
        'GalleryItem',
        'PaymentMethod',
        'Testimonial',
        'Partner',
        'Counter',
        'Faq',
        'NewsCategory',
        'News',
        'SocialLink',
        'FooterLink',
        'ContactMessage',
        'Department',
        'Branch',
        'Advertisement',
        'Subscriber',
        'AdminUser',
        'AuditLog',
        'Visit',
        'ProcessStep',
        'PricingPackage',
        'TeamMember',
        'ComparisonRow',
        'CtaBanner',
      ],
    });

  } catch (error: any) {
    console.error('Debug schema error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
