/**
 * Scholarships.af Scraper
 *
 * Source: https://scholarships.af/opportunities/?job_type=scholarship
 * Method:  HTML scraping via cheerio (WP JobSearch plugin; pagination is
 *          JS-driven so we parse the first listing page + its detail pages).
 *
 * List page structure:
 *   - `.jobsearch-joblisting-classic-wrap` → each opportunity card
 *     - `.jobsearch-pst-title a[href]` → detail URL + title
 *     - `.job-company-name a` → organization
 *     - `figure img[src]` → logo/featured image
 *     - `<li>` with "Deadline" → deadline text
 *     - `.jobsearch-option-btn` → type (Scholarship / Fellowship / ...)
 *
 * Detail page structure:
 *   - `<title>` → "Scholarship Name - Scholarships.af"
 *   - `.careerfy-company-name a` → organization
 *   - `.careerfy-jobdetail-services li` → label-value pairs
 *     (Gender, Level, Eligible Region/Countries, Medium, Field, Duration, ...)
 *   - `.jobsearch-description` → full description (HTML)
 *   - `a` with text "Apply Now" / class `careerfy-job-apply` → apply URL
 *
 * Pagination note: the listing uses JS pagination (links are `javascript:void(0)`),
 * so this scraper reads the first page of cards (typically 10 items). The
 * orchestrator runs frequently, so new opportunities are picked up over time.
 */

import * as cheerio from 'cheerio';
import { BaseScraper } from '../base-scraper';
import { resolveUrl, stripHtml, parseDate } from '../utils';
import type { RawListing, ScrapePage } from '../types';

export class ScholarshipsAfScraper extends BaseScraper {
  /**
   * Parse the listing page. Each card links to a detail page
   * `/opportunity/<slug>/` which `parseDetail()` enriches.
   */
  protected async parseListPage(html: string, pageUrl: string): Promise<ScrapePage> {
    const $ = cheerio.load(html);
    const listings: RawListing[] = [];

    $('.jobsearch-joblisting-classic-wrap').each(function () {
      const card = $(this);
      const titleLink = card.find('.jobsearch-pst-title a').first();
      const href = titleLink.attr('href') || '';
      const fullUrl = resolveUrl(href, pageUrl);
      if (!fullUrl) return;

      const title = titleLink.attr('title')?.trim() || titleLink.text().trim();

      // Organization
      const orgText = card.find('.job-company-name a').first().text().trim();
      const organization = orgText.replace(/^@\s*/i, '').trim() || null;

      // Image / logo
      const imgSrc = card.find('figure img').first().attr('src') || null;
      const imageUrl = imgSrc ? resolveUrl(imgSrc, pageUrl) : null;

      // Type (Scholarship / Fellowship / ...)
      const typeBtn = card.find('.jobsearch-option-btn').first().text().trim();
      const jobType = typeBtn ? typeBtn.toLowerCase() : 'scholarship';

      // Deadline — scan list items for "Deadline"
      let deadline: string | null = null;
      card.find('li').each(function () {
        const li = $(this).text().trim();
        if (/deadline/i.test(li) && !deadline) {
          // Extract date portion after "Deadline"
          const m = li.replace(/.*deadline\s*/i, '').trim();
          deadline = parseDate(m) || m || null;
        }
      });

      listings.push({
        title,
        sourceUrl: fullUrl,
        originalUrl: fullUrl,
        sourceName: 'Scholarships.af',
        sourceLanguage: 'en',
        organization,
        imageUrl,
        logoUrl: imageUrl,
        deadline,
        jobType,
        category: 'scholarship',
      });
    });

    // JS-driven pagination — no static next page URL.
    return { listings, nextPage: null };
  }

  /** Enrich a listing with full detail-page content. */
  protected async parseDetail(listing: RawListing): Promise<RawListing> {
    try {
      const html = await this.fetchText(listing.sourceUrl);
      const $ = cheerio.load(html);

      // Title from <title> tag (h1 is JS-rendered): "Name - Scholarships.af"
      const pageTitle = $('title').text().trim();
      if (pageTitle) {
        listing.title = pageTitle.replace(/\s*[-–—]\s*Scholarships\.af\s*$/i, '').trim() || listing.title;
      }

      // Organization
      const org = this.text($('.careerfy-company-name a').first());
      if (org) listing.organization = org.replace(/^@\s*/i, '').trim();

      // Service items (Gender, Level, Region, Medium, Field, Duration, ...)
      const services = this.extractServices($);
      if (services['Eligible Region/Countries']) {
        listing.eligibility = services['Eligible Region/Countries'];
      }
      if (services['Field of study']) {
        listing.category = services['Field of study'];
      }
      if (services.Duration) {
        listing.benefits = `Duration: ${services.Duration}`;
      }

      // Full description (strip ad scripts/ins)
      const descEl = $('.jobsearch-description').first().clone();
      descEl.find('script, ins.adsbygoogle, .code-block').remove();
      const descHtml = descEl.html() || '';
      if (descHtml.trim()) {
        listing.description = descHtml.trim();
      }

      // Extract deadline + key details from description if not already set
      if (!listing.deadline) {
        listing.deadline = this.extractDeadlineFromText(descEl.text());
      }

      // Extract eligibility / benefits sections from headings in description
      this.extractSections(descEl, listing);

      // Apply link — external URL in "Apply Now" button
      const applyUrl = this.findApplyLink($);
      if (applyUrl) listing.applyUrl = applyUrl;

      // Featured image / logo — grab from related-listing media if present
      if (!listing.imageUrl) {
        const logoSrc = $('.careerfy-joblisting-media img, .careerfy-services-text img').first().attr('src');
        if (logoSrc) {
          const url = resolveUrl(logoSrc, listing.sourceUrl);
          listing.imageUrl = url;
          listing.logoUrl = url;
        }
      }

      return listing;
    } catch (e) {
      console.error(`[scholarships.af] detail parse error for ${listing.sourceUrl}:`, e);
      return listing;
    }
  }

  /** Extract label-value pairs from `.careerfy-jobdetail-services li`. */
  private extractServices($: cheerio.CheerioAPI): Record<string, string> {
    const result: Record<string, string> = {};
    $('.careerfy-jobdetail-services li').each(function () {
      const label = $(this).find('.careerfy-services-text span').first().text().trim();
      const valueEl = $(this).find('.careerfy-services-text small, .careerfy-services-text div').first();
      const value = valueEl.text().trim();
      if (label && value) result[label.replace(/:$/, '').trim()] = value;
    });
    return result;
  }

  /** Find the external apply URL (Apply Now button). */
  private findApplyLink($: cheerio.CheerioAPI): string | null {
    let url: string | null = null;
    $('a').each(function () {
      const href = $(this).attr('href') || '';
      const text = $(this).text().trim().toLowerCase();
      const cls = $(this).attr('class') || '';
      if (
        (text.includes('apply now') || text.includes('apply for') || cls.includes('apply')) &&
        href && !href.startsWith('javascript') && href !== '#' &&
        !href.includes('scholarships.af') // external only
      ) {
        url = href;
        return false; // break
      }
    });
    return url;
  }

  /** Pull a date out of description text mentioning "Deadline". */
  private extractDeadlineFromText(text: string): string | null {
    const m = text.match(/deadline[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (m) return parseDate(m[1]) || m[1];
    return null;
  }

  /**
   * Extract eligibility / requirements / benefits from sub-headings within
   * the description body.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractSections(descEl: any, listing: RawListing): void {
    const $desc = descEl;
    $desc.children('h2, h3, h4').each(function (this: any) {
      const $h = $desc.find(this);
      const heading = $h.text().trim().toLowerCase();
      const bodyHtml = $h.nextUntil('h2, h3, h4').html() || '';
      if (!bodyHtml.trim()) return;
      const body = stripHtml(bodyHtml);
      if (heading.includes('eligib')) {
        listing.eligibility = listing.eligibility ? `${listing.eligibility}\n\n${body}` : body;
      } else if (heading.includes('benefit') || heading.includes('funding') ||
                 (heading.includes('cover') && heading.includes('what'))) {
        listing.benefits = listing.benefits ? `${listing.benefits}\n\n${body}` : body;
      } else if (heading.includes('require') || heading.includes('document')) {
        listing.requirements = listing.requirements ? `${listing.requirements}\n\n${body}` : body;
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private text(el: any): string {
    return el.text().trim() || '';
  }
}
