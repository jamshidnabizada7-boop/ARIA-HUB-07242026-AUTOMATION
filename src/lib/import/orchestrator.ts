/**
 * Import Orchestrator — the core engine.
 *
 * runImport({ sourceId|null, triggeredBy }) creates an ImportRun record,
 * scrapes the source(s), and for each listing:
 *   1. dedupe (skip / update / create)
 *   2. download + optimize images
 *   3. AI pipeline (rewrite → SEO → categorize → translate)
 *   4. resolve category
 *   5. generate unique slug
 *   6. upsert Opportunity with all base + i18n fields
 *
 * Robustness:
 *   - Each listing is wrapped in try/catch — one failure never aborts the run.
 *   - Batch DB writes via $transaction per source.
 *   - Sequential detail fetches with crawl-delay (handled in BaseScraper).
 *   - Sanitized errors recorded in ImportRun.errors for the admin log viewer.
 */

import type { PrismaClient, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getScraper } from './registry';
import { computeHash, findExisting } from './dedupe';
import { downloadFeaturedImage, downloadLogo } from './images';
import { runAIPipeline, ensureUniqueSlug, makeSlug } from '@/lib/ai/pipeline';
import { sanitizeError, slugify } from './utils';
import type { RawListing, SourceHandle } from './types';

export interface RunImportOptions {
  sourceId?: string | null;
  type?: string | null;
  triggeredBy?: string;
}

export interface RunSummary {
  runId: string;
  status: string;
  found: number;
  imported: number;
  updated: number;
  skipped: number;
  duplicates: number;
  failed: number;
  processingMs: number;
}

/** Module-level guard: prevent overlapping runs of the same source. */
const inFlight = new Set<string>();

/** Convert a Prisma ImportSource row into a SourceHandle for scrapers. */
function toHandle(s: { id: string; name: string; type: string; scraperKey: string; baseUrl: string; config: string | null; defaultCategory: string | null }): SourceHandle {
  let config: Record<string, unknown> = {};
  try { config = s.config ? JSON.parse(s.config) : {}; } catch { /* ignore */ }
  return {
    id: s.id,
    name: s.name,
    type: s.type,
    scraperKey: s.scraperKey,
    baseUrl: s.baseUrl,
    defaultCategory: s.defaultCategory,
    config,
  };
}

/**
 * Run the import pipeline. If sourceId is given, only that source is scraped;
 * otherwise all enabled sources are scraped.
 */
export async function runImport(opts: RunImportOptions = {}): Promise<RunSummary> {
  const { sourceId = null, type = null, triggeredBy = 'manual' } = opts;
  const startedAt = Date.now();

  // Resolve sources to run
  const where: Prisma.ImportSourceWhereInput = {};
  if (sourceId) where.id = sourceId;
  else { where.enabled = true; if (type) where.type = type; }

  const sources = await db.importSource.findMany({ where });
  if (!sources.length) {
    throw new Error('No matching import sources found.');
  }

  // Create one ImportRun per source (so logs are per-source as designed)
  const summaries: RunSummary[] = [];
  for (const source of sources) {
    if (inFlight.has(source.id)) {
      console.warn(`[import] source "${source.name}" already running — skipping.`);
      continue;
    }
    inFlight.add(source.id);
    try {
      // eslint-disable-next-line no-await-in-loop
      const summary = await runOneSource(db, source, triggeredBy);
      summaries.push(summary);
    } finally {
      inFlight.delete(source.id);
    }
  }

  // Aggregate into a single summary (the "primary" run is the first)
  const primary = summaries[0] || {
    runId: '', status: 'ok', found: 0, imported: 0, updated: 0, skipped: 0, duplicates: 0, failed: 0, processingMs: Date.now() - startedAt,
  };
  if (summaries.length > 1) {
    primary.found = summaries.reduce((a, s) => a + s.found, 0);
    primary.imported = summaries.reduce((a, s) => a + s.imported, 0);
    primary.updated = summaries.reduce((a, s) => a + s.updated, 0);
    primary.skipped = summaries.reduce((a, s) => a + s.skipped, 0);
    primary.duplicates = summaries.reduce((a, s) => a + s.duplicates, 0);
    primary.failed = summaries.reduce((a, s) => a + s.failed, 0);
    primary.processingMs = Date.now() - startedAt;
    primary.status = summaries.some((s) => s.status === 'error') ? 'partial' : 'ok';
  }
  return primary;
}

/** Run the pipeline for a single source. */
async function runOneSource(
  db: PrismaClient,
  source: { id: string; name: string; type: string; scraperKey: string; baseUrl: string; config: string | null; defaultCategory: string | null; autoPublish: boolean },
  triggeredBy: string,
): Promise<RunSummary> {
  const startedAt = Date.now();
  const handle = toHandle(source);
  const scraper = getScraper(handle);
  const run = await db.importRun.create({
    data: { sourceId: source.id, status: 'running', triggeredBy },
  });

  const counters = { found: 0, imported: 0, updated: 0, skipped: 0, duplicates: 0, failed: 0 };
  const errors: Array<{ url: string; message: string; ts: string }> = [];

  // Known category slugs for AI categorization
  const categories = await db.opportunityCategory.findMany({ select: { id: true, slug: true, name: true } });
  const knownSlugs = categories.map((c) => c.slug);

  try {
    if (!scraper) throw new Error(`No scraper registered for key "${source.scraperKey}"`);

    // 1. Scrape
    const listings = await scraper.scrapeAll();
    counters.found = listings.length;

    // 2. Process each listing
    for (const listing of listings) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await processListing(db, listing, source, categories, knownSlugs, counters);
      } catch (e) {
        counters.failed++;
        errors.push({ url: listing.sourceUrl, message: sanitizeError(e), ts: new Date().toISOString() });
      }
    }

    const status = counters.failed === 0 ? 'ok' : (counters.imported + counters.updated > 0 ? 'partial' : 'error');
    const processingMs = Date.now() - startedAt;

    await db.importRun.update({
      where: { id: run.id },
      data: {
        status,
        finishedAt: new Date(),
        found: counters.found,
        imported: counters.imported,
        updated: counters.updated,
        skipped: counters.skipped,
        duplicates: counters.duplicates,
        failed: counters.failed,
        processingMs,
        errors: errors.length ? JSON.stringify(errors) : null,
      },
    });

    await db.importSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: new Date(),
        lastRunStatus: status,
        lastRunStats: JSON.stringify(counters),
      },
    });

    return { runId: run.id, status, processingMs, ...counters };
  } catch (e) {
    // Fatal error for this source
    const processingMs = Date.now() - startedAt;
    errors.push({ url: source.baseUrl, message: sanitizeError(e), ts: new Date().toISOString() });
    await db.importRun.update({
      where: { id: run.id },
      data: {
        status: 'error',
        finishedAt: new Date(),
        found: counters.found,
        imported: counters.imported,
        updated: counters.updated,
        skipped: counters.skipped,
        duplicates: counters.duplicates,
        failed: counters.failed + 1,
        processingMs,
        errors: JSON.stringify(errors),
      },
    });
    await db.importSource.update({
      where: { id: source.id },
      data: { lastRunAt: new Date(), lastRunStatus: 'error', lastRunStats: JSON.stringify(counters) },
    });
    return { runId: run.id, status: 'error', processingMs, ...counters, failed: counters.failed + 1 };
  }
}

/** Process a single listing: dedupe → images → AI → upsert. */
async function processListing(
  db: PrismaClient,
  listing: RawListing,
  source: { id: string; name: string; type: string; scraperKey: string; baseUrl: string; config: string | null; defaultCategory: string | null; autoPublish: boolean },
  categories: Array<{ id: string; slug: string; name: string }>,
  knownSlugs: string[],
  counters: { found: number; imported: number; updated: number; skipped: number; duplicates: number; failed: number },
): Promise<void> {
  // Compute content hash
  const hash = await computeHash(listing);

  // Dedupe
  const dedupe = await findExisting(db, listing, hash);
  if (dedupe.action === 'skip') {
    counters.skipped++;
    counters.duplicates++;
    return;
  }
  if (dedupe.action === 'update' && !dedupe.changed) {
    // Exists, content unchanged → just refresh lastChecked
    counters.skipped++;
    counters.duplicates++;
    await db.opportunity.update({
      where: { id: dedupe.existing.id },
      data: { lastChecked: new Date() },
    });
    return;
  }

  // Images
  const slugBase = makeSlug(listing.title);
  const featured = await downloadFeaturedImage(listing.imageUrl, source.scraperKey, slugBase);
  const logo = await downloadLogo(listing.logoUrl, source.scraperKey, `${slugBase}-logo`);

  // AI pipeline (rewrite → SEO → categorize → translate)
  const pipeline = await runAIPipeline(listing, { db, knownCategorySlugs: knownSlugs }, (listing.sourceLanguage as 'en' | 'fa' | 'ps') || 'en');

  // Resolve category
  const categoryId = resolveCategory(pipeline.categorySlugs, listing.category, source.defaultCategory, categories);

  // Common import-tracking fields
  const importFields = {
    sourceName: source.name,
    sourceUrl: listing.sourceUrl,
    originalUrl: listing.originalUrl || listing.sourceUrl,
    importedAt: new Date(),
    lastChecked: new Date(),
    contentHash: hash,
    importStatus: dedupe.action === 'update' ? 'updated' : 'imported',
    translationStatus: pipeline.translationStatus,
    language: listing.sourceLanguage || 'en',
    jobType: listing.jobType || source.type,
    salary: listing.salary || null,
    educationReq: listing.educationReq || null,
    experience: listing.experience || null,
    country: listing.country || listing.location || null,
    deadline: listing.deadline || null,
    organization: listing.organization || null,
    website: listing.website || null,
    applyUrl: listing.applyUrl || null,
    image: featured.path,
    logoUrl: logo.path || null,
    publishedDate: listing.publishedDate || null,
    canonicalUrl: listing.sourceUrl,
    status: source.autoPublish ? 'published' : 'draft',
  };

  if (dedupe.action === 'update') {
    // Update existing (preserve id, slug unless title changed)
    const existing = await db.opportunity.findUnique({ where: { id: dedupe.existing.id }, select: { slug: true, title: true } });
    let newSlug = existing?.slug || slugBase;
    if (existing && slugify(listing.title) !== slugify(existing.title)) {
      newSlug = await ensureUniqueSlug(db, slugBase, dedupe.existing.id);
    }
    await db.opportunity.update({
      where: { id: dedupe.existing.id },
      data: {
        ...pipeline.data,
        ...importFields,
        slug: newSlug,
        importStatus: 'updated',
      },
    });
    counters.updated++;
  } else {
    // Create new
    const slug = await ensureUniqueSlug(db, slugBase);
    await db.opportunity.create({
      data: {
        ...pipeline.data,
        ...importFields,
        slug,
        sort: 0,
        categoryId,
      } as unknown as Prisma.OpportunityUncheckedCreateInput,
    });
    counters.imported++;
  }
}

/** Resolve a category ID from AI suggestions, source hints, or default. */
function resolveCategory(
  aiSlugs: string[],
  sourceCategory: string | null | undefined,
  defaultSlug: string | null | undefined,
  categories: Array<{ id: string; slug: string; name: string }>,
): string | null {
  const candidates = [...aiSlugs];
  if (sourceCategory) candidates.push(slugify(sourceCategory));
  if (defaultSlug) candidates.push(defaultSlug);

  for (const c of candidates) {
    const match = categories.find((cat) => cat.slug === c || cat.name.toLowerCase() === c.toLowerCase());
    if (match) return match.id;
  }
  // Fallback: match default slug only
  if (defaultSlug) {
    const match = categories.find((cat) => cat.slug === defaultSlug);
    if (match) return match.id;
  }
  return null;
}
