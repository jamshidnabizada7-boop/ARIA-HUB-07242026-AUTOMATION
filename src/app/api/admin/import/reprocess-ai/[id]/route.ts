import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, logAction } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { runAIPipeline } from '@/lib/ai/pipeline';
import type { RawListing } from '@/lib/import/types';

/**
 * POST /api/admin/import/reprocess-ai/:opportunityId
 *
 * Re-runs the AI pipeline (rewrite → SEO → translate) on an existing
 * opportunity, updating its i18n fields in place. Useful for opportunities
 * imported in no-AI mode (translationStatus='pending') to retroactively
 * enrich them once an AI provider is configured.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const opp = await db.opportunity.findUnique({ where: { id } });
  if (!opp) return NextResponse.json({ error: 'Opportunity not found.' }, { status: 404 });

  // Rebuild a RawListing from stored fields
  const listing: RawListing = {
    title: opp.title,
    organization: opp.organization,
    description: opp.description,
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
  };

  const categories = await db.opportunityCategory.findMany({ select: { id: true, slug: true, name: true } });
  const knownSlugs = categories.map((c) => c.slug);

  try {
    const pipeline = await runAIPipeline(listing, { db, knownCategorySlugs: knownSlugs }, (opp.language as 'en' | 'fa' | 'ps') || 'en');

    await db.opportunity.update({
      where: { id },
      data: {
        ...pipeline.data,
        translationStatus: pipeline.translationStatus,
        lastChecked: new Date(),
      },
    });

    await logAction({
      userId: admin.id,
      action: 'reprocess_ai',
      entity: 'opportunity',
      entityId: id,
      details: `translationStatus=${pipeline.translationStatus}`,
      req,
    });

    return NextResponse.json({ success: true, translationStatus: pipeline.translationStatus });
  } catch (e: any) {
    console.error('[import/reprocess-ai] error:', e);
    return NextResponse.json({ error: e?.message || 'Reprocess failed.' }, { status: 500 });
  }
}
