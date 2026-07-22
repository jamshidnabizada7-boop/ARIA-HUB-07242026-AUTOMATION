/**
 * AI Pipeline — orchestrates rewrite → SEO → categorize → translate for one
 * RawListing and returns a fully-populated object ready for Prisma upsert.
 *
 * Output shape uses the EXACT {en, fa, ps} i18n pattern that the existing
 * `getLocalizedContent()` helper consumes. No separate translation system.
 *
 * On partial AI failure, saves whatever languages succeeded and marks
 * translationStatus='partial'. In no-AI mode, stores scraped content verbatim.
 */

import type { PrismaClient } from '@prisma/client';
import { getAIProvider } from './provider';
import { slugify, stripHtml } from '../import/utils';
import type { RawListing } from '../import/types';

/** The three supported language codes (matches the site's i18n system). */
const LANGS = ['en', 'fa', 'ps'] as const;
type Lang = (typeof LANGS)[number];

export interface PipelineOutput {
  /** Prisma data object (base fields + i18n fields). */
  data: Record<string, unknown>;
  /** Category slug suggestions from the AI. */
  categorySlugs: string[];
  /** Translation completeness. */
  translationStatus: 'complete' | 'partial' | 'pending';
}

/**
 * Run the full AI pipeline on a listing.
 * `originalLang` is the source language (default 'en').
 */
export async function runAIPipeline(
  listing: RawListing,
  ctx: { db: PrismaClient; knownCategorySlugs: string[] },
  originalLang: Lang = 'en',
): Promise<PipelineOutput> {
  const provider = await getAIProvider();

  // ── No-AI mode: store verbatim, mark pending ──
  if (!provider) {
    return noAIMode(listing, originalLang);
  }

  const sourceText = buildSourceText(listing);
  const title = listing.title;
  const data: Record<string, unknown> = {};

  // 1. Rewrite (English)
  const rewrite = await safe(provider.rewrite(sourceText, { type: listing.jobType || undefined }));
  const rewrittenDesc = rewrite?.text || listing.description || sourceText;
  const summary = rewrite?.summary || '';

  // 2. SEO (English, generated from rewritten content)
  const seoEn = await safe(provider.generateSEO(rewrittenDesc, 'en', { title }));

  // 3. Categorize
  const cats = await safe(provider.categorize(sourceText, ctx.knownCategorySlugs));
  const categorySlugs = Array.isArray(cats) && cats.length ? cats : [];

  // 4. Translate title + description + sections into fa and ps
  // i18n objects keyed by language
  const titleI18n: Record<string, string> = { en: title };
  const descI18n: Record<string, string> = { en: rewrittenDesc };
  const summaryI18n: Record<string, string> = {};
  const seoTitleI18n: Record<string, string> = {};
  const seoDescI18n: Record<string, string> = {};
  const seoKeywordsI18n: Record<string, string[]> = {};
  const ogTitleI18n: Record<string, string> = {};
  const ogDescI18n: Record<string, string> = {};

  // English SEO fields
  if (seoEn) {
    if (seoEn.seoTitle) seoTitleI18n.en = seoEn.seoTitle;
    if (seoEn.metaDescription) seoDescI18n.en = seoEn.metaDescription;
    if (seoEn.keywords.length) seoKeywordsI18n.en = seoEn.keywords;
    if (seoEn.ogTitle) ogTitleI18n.en = seoEn.ogTitle;
    if (seoEn.ogDescription) ogDescI18n.en = seoEn.ogDescription;
  }
  if (summary) summaryI18n.en = summary;

  // Translate sections that exist on the listing
  const sectionFields: Array<{ key: string; value?: string | null }> = [
    { key: 'eligibility', value: listing.eligibility },
    { key: 'benefits', value: listing.benefits },
    { key: 'responsibilities', value: listing.responsibilities },
    { key: 'requirements', value: listing.requirements || listing.requiredDocuments },
  ];
  const sectionI18n: Record<string, Record<string, string>> = {};
  for (const s of sectionFields) {
    if (s.value) sectionI18n[s.key] = { en: s.value };
  }

  // Translate to fa + ps
  const targetLangs: Lang[] = ['fa', 'ps'];
  let translationsOk = 0;
  const expectedTranslations = targetLangs.length; // per-field count tracked below

  for (const lang of targetLangs) {
    try {
      // Title
      titleI18n[lang] = await provider.translate(title, originalLang, lang, { context: listing.organization || '' });
      // Description (use rewritten)
      descI18n[lang] = await provider.translate(rewrittenDesc, originalLang, lang);
      // Summary
      if (summary) summaryI18n[lang] = await provider.translate(summary, originalLang, lang);
      // Sections
      for (const s of sectionFields) {
        if (s.value && sectionI18n[s.key]) {
          sectionI18n[s.key][lang] = await provider.translate(s.value, originalLang, lang);
        }
      }
      // SEO for this language
      const seoLang = await provider.generateSEO(descI18n[lang] || rewrittenDesc, lang, { title: titleI18n[lang] });
      if (seoLang.seoTitle) seoTitleI18n[lang] = seoLang.seoTitle;
      if (seoLang.metaDescription) seoDescI18n[lang] = seoLang.metaDescription;
      if (seoLang.keywords.length) seoKeywordsI18n[lang] = seoLang.keywords;
      if (seoLang.ogTitle) ogTitleI18n[lang] = seoLang.ogTitle;
      if (seoLang.ogDescription) ogDescI18n[lang] = seoLang.ogDescription;
      translationsOk++;
    } catch (e) {
      console.error(`[ai] translation to ${lang} failed:`, e);
    }
  }

  const translationStatus: 'complete' | 'partial' =
    translationsOk === expectedTranslations ? 'complete' : 'partial';

  // ── Assemble base fields + i18n objects ──
  data.title = title;
  data.titleI18n = titleI18n;
  data.description = rewrittenDesc;
  data.descriptionI18n = descI18n;
  if (summary) {
    data.aiSummary = summary;
    data.aiSummaryI18n = summaryI18n;
  }

  // Sections
  for (const s of sectionFields) {
    if (s.value && sectionI18n[s.key]) {
      data[s.key] = s.value;
      data[`${s.key}I18n`] = sectionI18n[s.key];
    }
  }

  // SEO (base = English)
  if (seoEn) {
    data.seoTitle = seoEn.seoTitle || null;
    data.seoDescription = seoEn.metaDescription || null;
    data.canonicalUrl = listing.sourceUrl;
  }
  if (Object.keys(seoTitleI18n).length) data.seoTitleI18n = seoTitleI18n;
  if (Object.keys(seoDescI18n).length) data.seoDescriptionI18n = seoDescI18n;
  if (Object.keys(seoKeywordsI18n).length) {
    data.seoKeywords = JSON.stringify(seoKeywordsI18n.en || []);
    data.seoKeywordsI18n = seoKeywordsI18n;
  }
  if (Object.keys(ogTitleI18n).length) data.ogTitleI18n = ogTitleI18n;
  if (Object.keys(ogDescI18n).length) data.ogDescriptionI18n = ogDescI18n;

  // Tags (from keywords)
  const tagsEn = seoEn?.keywords || [];
  if (tagsEn.length) {
    data.tags = JSON.stringify(tagsEn);
    const tagsI18n: Record<string, string[]> = { en: tagsEn };
    for (const lang of targetLangs) {
      if (seoKeywordsI18n[lang]) tagsI18n[lang] = seoKeywordsI18n[lang];
    }
    data.tagsI18n = tagsI18n;
  }

  return { data, categorySlugs, translationStatus };
}

/** No-AI fallback: store scraped content verbatim, mark translation pending. */
function noAIMode(listing: RawListing, originalLang: Lang): PipelineOutput {
  const data: Record<string, unknown> = {
    title: listing.title,
    description: listing.description || stripHtml(listing.title),
    language: originalLang,
  };
  if (listing.eligibility) data.eligibility = listing.eligibility;
  if (listing.benefits) data.benefits = listing.benefits;
  if (listing.responsibilities) data.responsibilities = listing.responsibilities;
  if (listing.requirements || listing.requiredDocuments) {
    data.requirements = listing.requirements || listing.requiredDocuments;
  }
  return { data, categorySlugs: [], translationStatus: 'pending' };
}

/** Build a single text blob from all available listing fields for rewriting. */
function buildSourceText(l: RawListing): string {
  const parts: string[] = [];
  parts.push(`Title: ${l.title}`);
  if (l.organization) parts.push(`Organization: ${l.organization}`);
  if (l.deadline) parts.push(`Deadline: ${l.deadline}`);
  if (l.location) parts.push(`Location: ${l.location}`);
  if (l.salary) parts.push(`Salary: ${l.salary}`);
  if (l.experience) parts.push(`Experience: ${l.experience}`);
  if (l.educationReq) parts.push(`Education: ${l.educationReq}`);
  if (l.description) parts.push(`\nDescription:\n${stripHtml(l.description)}`);
  if (l.eligibility) parts.push(`\nEligibility:\n${stripHtml(l.eligibility)}`);
  if (l.responsibilities) parts.push(`\nResponsibilities:\n${stripHtml(l.responsibilities)}`);
  if (l.benefits) parts.push(`\nBenefits:\n${stripHtml(l.benefits)}`);
  if (l.requirements || l.requiredDocuments) {
    parts.push(`\nRequirements:\n${stripHtml(l.requirements || l.requiredDocuments || '')}`);
  }
  if (l.applyUrl) parts.push(`\nApplication link: ${l.applyUrl}`);
  return parts.join('\n');
}

/** Wrap a promise to never throw — returns null on failure. */
async function safe<T>(p: Promise<T>): Promise<T | null> {
  try { return await p; } catch (e) { console.error('[ai] step failed:', e); return null; }
}

/** Ensure a slug is unique by appending a suffix if needed. */
export async function ensureUniqueSlug(db: PrismaClient, baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.opportunity.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) } })) {
    n++;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

/** Generate a base slug from a title. */
export function makeSlug(title: string): string {
  return slugify(title);
}
