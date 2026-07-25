import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, logAction } from '@/lib/admin-auth';
import { runAIPipeline, RawListing } from '@/lib/ai/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration on Vercel Pro, 60s on Hobby

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const take = parseInt(searchParams.get('take') || '10', 10);

    // Get opportunities that are missing jobTypeI18n
    // We check for records where jobTypeI18n is literally null
    const opps = await db.opportunity.findMany({
      where: {
        jobTypeI18n: { equals: null }
      },
      take,
      orderBy: { importedAt: 'desc' }
    });

    if (opps.length === 0) {
      return NextResponse.json({ message: 'No opportunities need retranslation. All done!' });
    }

    const categories = await db.opportunityCategory.findMany({ select: { id: true, slug: true, name: true } });
    const knownSlugs = categories.map((c) => c.slug);

    let processed = 0;
    for (const opp of opps) {
      const listing: RawListing = {
        title: opp.title,
        description: opp.description || '',
        eligibility: opp.eligibility,
        benefits: opp.benefits,
        responsibilities: opp.responsibilities,
        requirements: opp.requirements,
        deadline: opp.deadline,
        country: opp.country,
        salary: opp.salary,
        experience: opp.experience,
        educationReq: opp.educationReq,
        jobType: opp.jobType || undefined,
        applyUrl: opp.applyUrl,
        sourceUrl: opp.sourceUrl || opp.canonicalUrl || '',
        sourceName: opp.sourceName || 'manual',
        sourceLanguage: opp.language || 'en',
        imageUrl: opp.image,
        logoUrl: opp.logoUrl,
        extractedData: opp.extractedData as any,
      };

      try {
        const pipeline = await runAIPipeline(listing, { db, knownCategorySlugs: knownSlugs }, (opp.language as any) || 'en');
        await db.opportunity.update({
          where: { id: opp.id },
          data: {
            ...pipeline.data,
            translationStatus: pipeline.translationStatus,
            lastChecked: new Date(),
          },
        });
        processed++;
      } catch (e) {
        console.error(`Failed to retranslate opp ${opp.id}:`, e);
      }
    }

    return NextResponse.json({ message: `Successfully retranslated ${processed} opportunities. Run again if more needed.` });
  } catch (e: any) {
    console.error('[retranslate-all] error:', e);
    return NextResponse.json({ error: e.message || 'Translation failed' }, { status: 500 });
  }
}
