/**
 * Import Pipeline — prepares a RawListing for Prisma upsert.
 *
 * This pipeline has been simplified to bypass all AI translation and 
 * rewriting logic, keeping scrapes exactly in their original language.
 */

import type { PrismaClient } from '@prisma/client';
import { slugify, stripHtml } from '../import/utils';
import type { RawListing } from '../import/types';

/** The three supported language codes. */
const LANGS = ['en', 'fa', 'ps'] as const;
type Lang = (typeof LANGS)[number];

export interface PipelineOutput {
  /** Prisma data object (base fields + i18n fields). */
  data: Record<string, unknown>;
  /** Category slug suggestions (empty without AI). */
  categorySlugs: string[];
  /** Translation completeness (hardcoded to complete since translations are disabled). */
  translationStatus: 'complete' | 'partial' | 'pending';
}

/**
 * Run the pipeline on a listing.
 * `originalLang` is the source language (default 'en').
 */
export async function runAIPipeline(
  listing: RawListing,
  ctx: { db: PrismaClient; knownCategorySlugs: string[] },
  originalLang: Lang = 'en',
): Promise<PipelineOutput> {
  const plainDescription = stripHtml(listing.description || listing.title || '').trim();
  const shortDesc = plainDescription.substring(0, 155) + (plainDescription.length > 155 ? '...' : '');

  const data: Record<string, unknown> = {
    title: listing.title,
    description: listing.description || plainDescription,
    language: originalLang,
    jobType: listing.jobType || null,
    salary: listing.salary || null,
    educationReq: listing.educationReq || null,
    experience: listing.experience || null,
    extractedData: listing.extractedData || null,
    
    // Auto-fill SEO and summary fields
    seoTitle: listing.title,
    seoDescription: shortDesc,
    ogTitle: listing.title,
    ogDescription: shortDesc,
    aiSummary: shortDesc,
  };
  
  if (listing.eligibility) data.eligibility = listing.eligibility;
  if (listing.benefits) data.benefits = listing.benefits;
  if (listing.responsibilities) data.responsibilities = listing.responsibilities;
  if (listing.requirements || listing.requiredDocuments) {
    data.requirements = listing.requirements || listing.requiredDocuments;
  }
  
  // Set the i18n field for the original language to ensure the UI can display it
  data.titleI18n = { [originalLang]: listing.title };
  data.descriptionI18n = { [originalLang]: data.description };
  data.seoTitleI18n = { [originalLang]: listing.title };
  data.seoDescriptionI18n = { [originalLang]: shortDesc };
  data.ogTitleI18n = { [originalLang]: listing.title };
  data.ogDescriptionI18n = { [originalLang]: shortDesc };
  data.aiSummaryI18n = { [originalLang]: shortDesc };
  
  const sectionFields: Array<{ key: string; value?: string | null }> = [
    { key: 'eligibility', value: listing.eligibility },
    { key: 'benefits', value: listing.benefits },
    { key: 'responsibilities', value: listing.responsibilities },
    { key: 'requirements', value: listing.requirements || listing.requiredDocuments },
    { key: 'jobType', value: listing.jobType },
    { key: 'salary', value: listing.salary },
    { key: 'educationReq', value: listing.educationReq },
    { key: 'experience', value: listing.experience },
  ];
  
  for (const s of sectionFields) {
    if (s.value) {
      data[`${s.key}I18n`] = { [originalLang]: s.value };
    }
  }

  if (listing.extractedData && typeof listing.extractedData === 'object') {
    data.extractedDataI18n = { [originalLang]: { ...listing.extractedData } };
  }

  return { data, categorySlugs: [], translationStatus: 'complete' };
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
