import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { WazifahaJobsScraper } from '@/lib/import/scrapers/wazifaha';
import { ScholarshipsAfScraper } from '@/lib/import/scrapers/scholarships-af';

/**
 * Simple import endpoint that bypasses Prisma entirely
 * Uses direct Turso client for all database operations
 */
export async function GET() {
  try {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
      }, { status: 500 });
    }

    console.log('🚀 Starting simple import...');
    const client = createClient({ url: tursoUrl, authToken: tursoToken });

    // Get import sources
    const sources = await client.execute('SELECT * FROM ImportSource WHERE enabled = 1');
    
    if (sources.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No import sources found. Did you run the migrate endpoint?',
      }, { status: 404 });
    }

    let totalImported = 0;
    const results: any[] = [];

    // Process each source
    for (const source of sources.rows) {
      console.log(`📥 Processing source: ${source.name}`);
      
      try {
        let scraper;
        if (source.scraperKey === 'wazifaha') {
          scraper = new WazifahaJobsScraper();
        } else if (source.scraperKey === 'scholarshipsAf') {
          scraper = new ScholarshipsAfScraper();
        } else {
          console.log(`⚠️ Unknown scraper: ${source.scraperKey}`);
          continue;
        }

        // Scrape listings
        const listings = await scraper.scrape({ maxPages: 2 });
        console.log(`📋 Found ${listings.length} listings from ${source.name}`);

        // Get existing opportunity URLs to avoid duplicates
        const existing = await client.execute('SELECT sourceUrl FROM Opportunity WHERE sourceUrl IS NOT NULL');
        const existingUrls = new Set(existing.rows.map((r: any) => r.url));

        let imported = 0;
        for (const listing of listings) {
          if (existingUrls.has(listing.url)) {
            console.log(`⏭️ Skipping duplicate: ${listing.title}`);
            continue;
          }

          // Create slug from title
          const slug = listing.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100) + '-' + Date.now();

          // Insert opportunity
          await client.execute({
            sql: `INSERT INTO Opportunity (
              id, title, slug, description, content, type, status, featured,
              featuredImage, deadline, location, salary, organizationName,
              applyUrl, sourceUrl, importedAt, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              `opp-${Date.now()}-${imported}`,
              listing.title,
              slug,
              listing.description || listing.title,
              listing.description || listing.title,
              source.type || 'job',
              'published',
              0,
              listing.image || null,
              listing.deadline || null,
              listing.location || null,
              listing.salary || null,
              listing.organization || null,
              listing.applyUrl || listing.url,
              listing.url,
              new Date().toISOString(),
              new Date().toISOString(),
              new Date().toISOString(),
            ]
          });

          imported++;
          totalImported++;
        }

        results.push({
          source: source.name,
          found: listings.length,
          imported,
          skipped: listings.length - imported,
        });

      } catch (error: any) {
        console.error(`❌ Error processing ${source.name}:`, error);
        results.push({
          source: source.name,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ Import completed! Imported ${totalImported} opportunities`,
      results,
      nextSteps: [
        '✅ Import successful!',
        `Imported ${totalImported} opportunities`,
        '1. Visit: https://www.myariahub.com',
        '2. Check the opportunities section',
        '3. Data is now live!',
      ]
    });

  } catch (error: any) {
    console.error('❌ Import failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
