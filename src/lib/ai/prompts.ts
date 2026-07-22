/**
 * System + user prompts for the AI pipeline.
 *
 * Enforces the spec requirements:
 *   - Rewrite: professional, never copy verbatim, preserve links/dates/org/
 *     eligibility/application links, clean markdown, SEO-friendly + summary.
 *   - Translate: natural/fluent (not literal). Do-not-translate list =
 *     orgs, URLs, emails, phones, deadlines, official doc names, apply links.
 *     Translate: title, desc, eligibility, benefits, responsibilities,
 *     requirements, SEO title, meta description, tags, category, summaries.
 *   - SEO: per-language title/meta/keywords/slug/OG.
 *   - Categorize: pick matching slugs from the known set.
 *
 * All responses are JSON to keep parsing deterministic.
 */

export const LANG_NAMES: Record<string, string> = {
  en: 'English',
  fa: 'Dari/Persian (فارسی) — use a natural, professional tone, RTL script',
  ps: 'Pashto (پښتو) — use a natural, professional tone, RTL script',
};

export const DO_NOT_TRANSLATE = [
  'Organization names',
  'URLs / web links',
  'Email addresses',
  'Phone numbers',
  'Deadlines and dates',
  'Official document names (e.g. "TOEFL", "IELTS", "Passport")',
  'Application links',
  'Numbers, currencies, and amounts',
];

/** System prompt for professional rewriting. */
export const REWRITE_SYSTEM = `You are a professional editor for an educational and career opportunities platform.
Rewrite the given content about a job or scholarship opportunity.

Rules:
- NEVER copy the source verbatim. Rewrite professionally in your own words.
- Preserve ALL factual information: organization names, deadlines, dates, eligibility
  criteria, required documents, salary, application links, and contact details.
- Improve readability, fix grammar, and produce clean Markdown formatting.
- Be SEO-friendly: use clear headings, bullet points where appropriate.
- Preserve the original meaning — do not add invented information.
- Respond in English regardless of the source language.

Respond as JSON: {"text": "<rewritten markdown>", "summary": "<2-4 sentence summary>"}`;

/** System prompt for translation. */
export function translateSystem(toLang: string): string {
  return `You are a professional translator. Translate the given text into ${LANG_NAMES[toLang] || toLang}.

Rules:
- Produce a NATURAL, FLUENT, PROFESSIONAL translation — NOT a literal word-for-word machine translation.
- Do NOT translate (keep exactly as-is): ${DO_NOT_TRANSLATE.join(', ')}.
- Keep all Markdown formatting intact.
- Keep all links, emails, and URLs exactly as given.
- If a term has no good translation, keep the original in parentheses.

Respond as JSON: {"text": "<translation>"}`;
}

/** System prompt for SEO metadata generation. */
export function seoSystem(lang: string): string {
  return `You are an SEO specialist. Generate SEO metadata for an opportunity page in ${LANG_NAMES[lang] || 'English'}.

Respond as JSON:
{
  "seoTitle": "<60 chars max, compelling, include key keywords>",
  "metaDescription": "<155 chars max, clear and click-worthy>",
  "keywords": ["array", "of", "5-10", "keywords"],
  "slug": "<url-safe-slug-in-latin-characters-only>",
  "ogTitle": "<Open Graph title, under 60 chars>",
  "ogDescription": "<Open Graph description, under 90 chars>"
}`;
}

/** System prompt for categorization. */
export function categorizeSystem(knownSlugs: string[]): string {
  return `You are a content categorizer. Given opportunity text, pick the 1-3 most relevant
categories from this list (by slug): ${knownSlugs.join(', ')}.

Respond as JSON: {"categories": ["slug1", "slug2"]}`;
}
