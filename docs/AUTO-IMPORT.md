# Automated Jobs & Scholarships Import System

A production-ready pipeline that crawls external websites, rewrites content with
AI, translates into all three supported languages (English, Dari/Persian,
Pashto), generates SEO metadata, downloads images, detects duplicates, and
publishes opportunities — all from the admin panel.

## Quick Start

### 1. Configure AI provider (optional but recommended)

Set one of these in your `.env`:

```bash
# Option A: ZAI (default — reuses existing z-ai-web-dev-sdk dependency)
AI_PROVIDER=zai
ZAI_API_KEY=your_zai_key

# Option B: OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini  (optional, default: gpt-4o-mini)

# Option C: Google Gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=...
# GEMINI_MODEL=gemini-2.0-flash  (optional)
```

**Without an AI provider**, imports still work: scraped content is stored
verbatim in English with `translationStatus='pending'`. You can later click
"Reprocess with AI" on individual opportunities after configuring a key.

### 2. Seed default sources & categories (one-time)

```bash
npx tsx scripts/seed-import-sources.ts
```

This creates two sources (Wazifaha Jobs, Scholarships.af) and 11 opportunity
categories with multilingual names.

### 3. Run an import

Open **Admin → Auto Import** and click **Run All Imports**, or run a specific
source. The first run may take a few minutes (it fetches detail pages).

---

## How It Works

```
Source website
    ↓  Scraper (cheerio / REST API)
RawListing
    ↓  Dedupe (sourceUrl → contentHash → fuzzy title+org)
    ↓  Image download + optimize (sharp → webp)
    ↓  AI Pipeline: rewrite → SEO → categorize → translate (en/fa/ps)
Opportunity (with titleI18n, descriptionI18n, etc.)
    ↓  Existing getLocalizedContent() resolves per visitor language
Visitor sees correct language
```

### Multilingual Architecture (Reused)

Every imported opportunity uses the **existing** `field` + `fieldI18n:{en,fa,ps}`
JSON pattern. The `getLocalizedContent()` helper in `src/lib/i18n-content.ts`
resolves the correct language for each visitor with fallback: requested →
English → base value. **No separate translation system was created.**

Translated fields: title, description, eligibility, benefits, responsibilities,
requirements, AI summary, SEO title, meta description, keywords, OG title,
OG description, tags.

**Not translated** (per spec): organization names, URLs, emails, phone numbers,
deadlines, official document names, application links.

---

## Admin Panel

**Admin → Auto Import** has three tabs:

1. **Dashboard** — stat cards (total imported, success rate, failed, last sync)
   + recent runs table.
2. **Sources** — enable/disable each source, toggle auto-publish per source,
   run a single source.
3. **Logs** — expandable run details with per-run errors.

Actions: Run All Imports, Run Specific Source, Retry Failed.

---

## Database Schema (additive)

New/extended models in `prisma/schema.prisma`:

- **`Opportunity`** — extended with import-tracking fields (sourceName,
  sourceUrl, originalUrl, importedAt, lastChecked, contentHash, aiSummary,
  jobType, salary, educationReq, experience, responsibilities, requirements,
  tags, SEO i18n fields, importStatus, translationStatus, language, logoUrl).
- **`ImportSource`** — one row per source website (name, type, scraperKey,
  baseUrl, enabled, autoPublish, scheduleMinutes, config, lastRun*).
- **`ImportRun`** — one row per import execution (counts, errors, timing).
- **`OpportunityCategory`** — added `nameI18n` for multilingual category names.

All new fields are optional — existing data is unaffected.

---

## Adding a New Source Website

The architecture is modular. To add a new website:

1. Create a scraper class in `src/lib/import/scrapers/<name>.ts`:

```typescript
import { BaseScraper } from '../base-scraper';
import type { ScrapePage } from '../types';

export class MySiteScraper extends BaseScraper {
  protected async parseListPage(html: string, pageUrl: string): Promise<ScrapePage> {
    // Parse html (via cheerio) and return { listings, nextPage }
  }

  protected async parseDetail(listing: RawListing): Promise<RawListing> {
    // Optional: fetch detail page to enrich the listing
  }
}
```

2. Register it in `src/lib/import/registry.ts`:

```typescript
import { MySiteScraper } from './scrapers/my-site';
export const SCRAPERS = {
  // ...
  mySite: MySiteScraper,
};
```

3. Add a source row via the admin panel (Source Manager) or directly:

```bash
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.importSource.create({
  data: { name: 'My Site', type: 'job', scraperKey: 'mySite', baseUrl: 'https://...' }
}).then(() => db.\$disconnect());
"
```

**That's it** — the orchestrator, dedupe, AI pipeline, images, and admin UI all
work automatically with the new source.

---

## API Endpoints

All under `/api/admin/import/` (admin-authenticated):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/run` | Trigger an import (`{sourceId?, type?}`) |
| GET | `/runs` | List runs (paginated) |
| GET | `/runs/:id` | Single run detail with errors |
| GET/POST | `/sources` | List / create sources |
| PUT/DELETE | `/sources/:id` | Update / delete a source |
| POST | `/sources/:id/toggle` | Toggle enabled/autoPublish |
| POST | `/retry-failed` | Re-run all enabled sources |
| POST | `/reprocess-ai/:opportunityId` | Re-run AI on one opportunity |
| GET | `/stats` | Dashboard statistics |

---

## Images

Downloaded and optimized via `sharp` into `public/uploads/imports/<sourceKey>/`:
- Featured images: max 1600px wide, webp, quality 82
- Logos: max 400px wide, webp

If download fails, the original remote URL is kept (hybrid fallback). If no
image exists, a placeholder is used. The two source domains are whitelisted in
`next.config.ts` → `images.remotePatterns`.

---

## Error Handling & Robustness

- Per-listing try/catch — one failure never aborts a run.
- Network retries with exponential backoff (in `BaseScraper.fetchText`).
- Crawl-delay respected between requests.
- Partial AI failures save available languages with `translationStatus='partial'`.
- All errors sanitized before logging (no secrets/stack traces in admin logs).
- Module-level in-flight guard prevents overlapping runs of the same source.

---

## File Map

```
prisma/schema.prisma                    # ImportSource, ImportRun, extended Opportunity
scripts/seed-import-sources.ts          # Seed sources + categories
src/lib/import/
  types.ts                              # Shared types (RawListing, etc.)
  utils.ts                              # slugify, stripHtml, parseDate, sha256, etc.
  base-scraper.ts                       # Abstract BaseScraper (fetch, retry, paginate)
  registry.ts                           # scraperKey → scraper class
  dedupe.ts                             # Duplicate detection + content hashing
  images.ts                             # Download + optimize (sharp)
  orchestrator.ts                       # runImport() — the core engine
  scrapers/
    wazifaha.ts                         # Wazifaha.org jobs (HTML/cheerio)
    scholarships-af.ts                  # Scholarships.af (HTML/cheerio)
src/lib/ai/
  provider.ts                           # Pluggable provider factory
  prompts.ts                            # System prompts (rewrite/translate/SEO/categorize)
  pipeline.ts                           # runAIPipeline() — rewrite→SEO→translate
  providers/
    zai.ts                              # Default (z-ai-web-dev-sdk)
    openai.ts                           # OpenAI (dynamic import)
    gemini.ts                           # Google Gemini (dynamic import)
    helpers.ts                          # parseJSON, retry
src/app/api/admin/import/               # All API routes
src/components/admin/auto-import-panel.tsx  # Admin UI panel
src/app/sitemap.ts                      # Enhanced with opportunity freshness
```
