/**
 * ACBAR Job Scraper
 *
 * Source: https://www.acbar.org/en/jobs
 * Method: HTML scraping via cheerio
 *
 * Detail page structure (class names from the live ACBAR site):
 *   - `.acbar-jd__title`                  → job title (h1)
 *   - `.acbar-jd__org`                     → organization name
 *   - `.acbar-jd__logo img[src]`           → organization logo
 *   - `.acbar-jd__info-table .acbar-jd__info-row` → dt (label) + dd (value) grid
 *       Type, Location, Category, Published, Nationality, Gender,
 *       Salary, Contract Duration, Vacancy Number, No of Job
 *   - `.acbar-jd__info-text`               → Education / Experience (h3 + p)
 *   - `.acbar-jd__deadline-value`          → deadline date
 *   - `.acbar-jd__badge`                   → status (Open / Closed)
 *   - `.acbar-jd__card`                    → article sections
 *       h2.acbar-jd__card-title → "About the Company" | "Job Summary"
 *                                   "Job Requirements" | "Submission Guideline"
 *       .acbar-jd__rich → section body HTML
 */

import * as cheerio from 'cheerio';
import { BaseScraper } from '../base-scraper';
import { resolveUrl, cleanHtmlWhitespace, stripHtml, parseDate } from '../utils';
import type { RawListing, ScrapePage } from '../types';

export class AcbarScraper extends BaseScraper {
  constructor(source: any) {
    super(source);
    if (!this.source.config) this.source.config = {};
    if (!this.source.config.maxPages) this.source.config.maxPages = 30;
  }

  /** Parse the list page — finds all /jobs/details/ links and paginates. */
  protected async parseListPage(html: string, pageUrl: string): Promise<ScrapePage> {
    const $ = cheerio.load(html);
    const listings: RawListing[] = [];

    // Each job card on the list page has at least one <a href="/en/jobs/details/ID/slug">
    // We dedupe by href to avoid duplicates from multiple links per card.
    const seenHrefs = new Set<string>();
    $('a').each(function () {
      const href = $(this).attr('href');
      if (!href || !href.includes('jobs/details')) return;
      if (seenHrefs.has(href)) return;
      seenHrefs.add(href);

      const fullUrl = resolveUrl(href, pageUrl);
      if (!fullUrl) return;

      const title = $(this).text().replace(/\s+/g, ' ').trim();

      listings.push({
        title: title.length > 5 ? title : 'ACBAR Job Opportunity',
        sourceUrl: fullUrl,
        originalUrl: fullUrl,
        sourceName: 'ACBAR',
        sourceLanguage: 'en',
        jobType: 'job',
      });
    });

    // Pagination: find the highest page= number linked on this page
    let nextPage: string | null = null;
    let maxPage = 0;
    $('a[href*="page="]').each(function () {
      const href = $(this).attr('href') || '';
      const match = href.match(/[?&]page=(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxPage) maxPage = num;
      }
    });

    const currentPageMatch = pageUrl.match(/[?&]page=(\d+)/);
    const currentPage = currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;

    if (maxPage > currentPage) {
      nextPage = resolveUrl(`?page=${currentPage + 1}`, pageUrl);
    }

    return { listings, nextPage };
  }

  /**
   * Fetch the detail page and extract all fields using the ACBAR `.acbar-jd__*`
   * class structure. This replaces the old generic colon-heuristic approach that
   * was picking up footer text, ACBAR office addresses, and raw nav HTML.
   */
  public async parseDetail(listing: RawListing): Promise<RawListing> {
    try {
      const html = await this.fetchText(listing.sourceUrl);
      const $ = cheerio.load(html);

      // ── Title ──────────────────────────────────────────────────────────────
      const title = $('.acbar-jd__title').first().text().trim();
      if (title && title.length > 3) listing.title = title;

      // ── Organization + Logo ────────────────────────────────────────────────
      const org = $('.acbar-jd__org').first().text().trim();
      if (org) listing.organization = org;

      const logoSrc = $('.acbar-jd__logo img').first().attr('src');
      if (logoSrc) {
        const logoUrl = resolveUrl(logoSrc, listing.sourceUrl);
        listing.logoUrl = logoUrl;
        if (!listing.imageUrl) listing.imageUrl = logoUrl;
      }

      // ── Info table (dl > .acbar-jd__info-row > dt + dd) ───────────────────
      // This is the "Quick Summary" grid with Type, Location, Category, etc.
      const extracted: Record<string, string> = {};
      $('.acbar-jd__info-row').each(function () {
        const label = $(this).find('dt, .acbar-jd__info-term').text().trim();
        const value = $(this).find('dd, .acbar-jd__info-desc').text().trim();
        if (label && value) extracted[label] = value;
      });

      // Education and Experience sit outside the dl in their own .acbar-jd__info-text blocks
      $('.acbar-jd__info-text').each(function () {
        const label = $(this).find('h3').text().trim();
        const value = $(this).find('p').text().trim();
        if (label && value) extracted[label] = value;
      });

      // Map to RawListing fields
      listing.location        = extracted['Location']          || null;
      listing.salary          = extracted['Salary']            || null;
      listing.experience      = extracted['Experience']        || null;
      listing.educationReq    = extracted['Education']         || null;
      listing.publishedDate   = parseDate(extracted['Published']) || null;
      listing.country         = 'Afghanistan';

      // jobType: ACBAR uses "Full Time", "Part Time", etc.
      if (extracted['Type']) listing.jobType = extracted['Type'];

      // Category hint from the info table
      if (extracted['Category']) listing.category = extracted['Category'];

      // Store everything for future reference
      listing.extractedData = { ...extracted };

      // ── Deadline ───────────────────────────────────────────────────────────
      const deadlineText = $('.acbar-jd__deadline-value').first().text().trim();
      if (deadlineText) listing.deadline = parseDate(deadlineText) || null;

      // ── Article sections ───────────────────────────────────────────────────
      // Each content block is an <article class="acbar-jd__card"> with:
      //   h2.acbar-jd__card-title  → section name
      //   .acbar-jd__rich          → section body HTML
      const descParts: string[] = [];

      $('.acbar-jd__card').each(function () {
        const sectionTitle = $(this).find('.acbar-jd__card-title').first().text().trim().toLowerCase();
        const bodyEl = $(this).find('.acbar-jd__rich').first();
        let bodyHtml = bodyEl.html() || '';
        // Sanitize to prevent layout breakage on frontend
        bodyHtml = bodyHtml.replace(/style="[^"]*"/gi, '');
        bodyHtml = bodyHtml.replace(/width="[^"]*"/gi, '');
        bodyHtml = bodyHtml.replace(/height="[^"]*"/gi, '');
        
        const bodyText = stripHtml(bodyHtml);
        if (!bodyText.trim()) return;

        if (sectionTitle.includes('requirement') || sectionTitle.includes('qualification')) {
          listing.requirements = bodyText;
        } else if (sectionTitle.includes('submission') || sectionTitle.includes('guideline') || sectionTitle.includes('how to apply')) {
          listing.guidelines = bodyText;
          // Try to extract an email apply link from the guideline text
          if (!listing.applyUrl) {
            const emailMatch = bodyText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
            if (emailMatch) listing.applyUrl = `mailto:${emailMatch[0]}`;
          }
        } else if (sectionTitle.includes('summary') || sectionTitle.includes('about the') || sectionTitle.includes('overview') || sectionTitle.includes('description')) {
          // Job Summary / About the Company → goes into description
          descParts.push(`<h3>${$(this).find('.acbar-jd__card-title').first().text().trim()}</h3>\n${bodyHtml}`);
        } else {
          // Any other section (e.g. "Job Objectives") also goes into description
          descParts.push(`<h3>${$(this).find('.acbar-jd__card-title').first().text().trim()}</h3>\n${bodyHtml}`);
        }
      });

      if (descParts.length) {
        listing.description = cleanHtmlWhitespace(descParts.join('\n\n'));
      }

      // ── Apply link ─────────────────────────────────────────────────────────
      // Priority 1: explicit external form/survey link anywhere on the page
      if (!listing.applyUrl) {
        $('a[href]').each(function () {
          const href = $(this).attr('href') || '';
          if (
            (href.includes('forms.') || href.includes('docs.google.com') || href.includes('survey')) &&
            !href.startsWith('/')
          ) {
            listing.applyUrl = href;
            return false; // break
          }
        });
      }

      // Priority 2: mailto link on the page (skip ACBAR's own webinfo@ address)
      if (!listing.applyUrl) {
        $('a[href^="mailto:"]').each(function () {
          const href = $(this).attr('href') || '';
          if (!href.includes('webinfo@acbar.org') && !href.includes('info@acbar.org')) {
            listing.applyUrl = href;
            return false; // break
          }
        });
      }

      return listing;
    } catch (e) {
      console.error(`[acbar] detail parse error for ${listing.sourceUrl}:`, e);
      return listing;
    }
  }
}
