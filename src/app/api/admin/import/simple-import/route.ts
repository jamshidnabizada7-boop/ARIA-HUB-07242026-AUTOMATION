import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getScraper } from '@/lib/import/registry';

export const maxDuration = 60; // Max allowed for Vercel Hobby

export async function GET() {
  try {
    console.log('🚀 Starting Prisma-based simple import...');

    // Get import sources from Prisma
    const sources = await db.importSource.findMany({
      where: { enabled: true }
    });
    
    if (sources.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No import sources found. Did you run the seed?',
      }, { status: 404 });
    }

    let totalImported = 0;
    const results: any[] = [];

    // Process each source
    for (const source of sources) {
      console.log(`📥 Processing source: ${source.name}`);
      
      try {
        // Create source handle for scraper
        const sourceHandle = {
          id: source.id,
          name: source.name,
          type: source.type,
          baseUrl: source.baseUrl,
          config: {
            maxPages: 3,
            detailFetch: true,
            crawlDelayMs: 1500,
            timeoutMs: 30000,
          }
        };

        const scraper = getScraper(sourceHandle);
        if (!scraper) {
          console.log(`⚠️ Unknown scraper: ${source.scraperKey}`);
          continue;
        }

        // Scrape listings
        const listings = await scraper.scrapeAll();
        console.log(`📋 Found ${listings.length} listings from ${source.name}`);

        let imported = 0;
        for (const listing of listings) {
          // Create slug from title
          const slug = listing.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100) + '-' + Date.now();

          // Upsert using Prisma
          // We use originalUrl or sourceUrl as the unique identifier logic
          const existing = await db.opportunity.findFirst({
            where: {
              OR: [
                { originalUrl: listing.originalUrl || listing.sourceUrl },
                { sourceUrl: listing.sourceUrl }
              ]
            }
          });

          if (existing) {
            console.log(`⏭️ Skipping/Updating duplicate: ${listing.title}`);
            await db.opportunity.update({
              where: { id: existing.id },
              data: {
                title: listing.title,
                description: listing.description || listing.title,
                organization: listing.organization,
                location: listing.location,
                country: listing.country,
                salary: listing.salary,
                experience: listing.experience,
                educationReq: listing.educationReq,
                deadline: listing.deadline,
                image: listing.imageUrl || listing.logoUrl,
                applyUrl: listing.applyUrl || listing.originalUrl,
                jobType: listing.jobType || source.type || 'job',
                extractedData: listing.extractedData || {},
                lastChecked: new Date(),
              }
            });
            continue;
          }

          // Insert new opportunity
          await db.opportunity.create({
            data: {
              title: listing.title,
              slug,
              description: listing.description || listing.title,
              status: source.autoPublish ? 'published' : 'draft',
              organization: listing.organization,
              location: listing.location,
              country: listing.country,
              salary: listing.salary,
              experience: listing.experience,
              educationReq: listing.educationReq,
              deadline: listing.deadline,
              image: listing.imageUrl || listing.logoUrl,
              applyUrl: listing.applyUrl || listing.originalUrl,
              sourceUrl: listing.sourceUrl,
              originalUrl: listing.originalUrl || listing.sourceUrl,
              sourceName: source.name,
              jobType: listing.jobType || source.type || 'job',
              extractedData: listing.extractedData || {},
              importedAt: new Date(),
              lastChecked: new Date(),
            }
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
