/**
 * Wazifaha Job Scraper
 *
 * Source: https://www.wazifaha.org/jobs/
 * Method:  HTML scraping via cheerio (no public API).
 *
 * List page structure:
 *   - `.wz-browse-link[href="/jobs/ID/slug"]` → individual listing links
 *   - `a[href*="page=N"]` → pagination
 *
 * Detail page structure:
 *   - `.wz-hero-title` → job title
 *   - `.wz-hero-org a` → organization name
 *   - `.wz-hero-logo img[src]` → organization logo
 *   - `.wz-pill` → quick info pills (job type, deadline, gender)
 *   - `.wz-details-grid .wz-grid-item` → label-value pairs
 *     (.wz-grid-label → field name, .wz-grid-value → field value)
 *   - `.wz-content-card .wz-section-body` → description body (HTML)
 *   - `a[href*="/jobs/apply/"]` → apply link
 */

import * as cheerio from 'cheerio';
import { BaseScraper } from '../base-scraper';
import { resolveUrl, stripHtml, parseDate } from '../utils';
import type { RawListing, ScrapePage } from '../types';

export class WazifahaScraper extends BaseScraper {
  /** Parse the job listing list page. Returns titles + URLs, paginates. */
  protected async parseListPage(html: string, pageUrl: string): Promise<ScrapePage> {
    const $ = cheerio.load(html);
    const listings: RawListing[] = [];

    // Each job link: <a class="wz-browse-link" href="/jobs/ID/slug">
    $('a.wz-browse-link').each(function () {
      const href = $(this).attr('href');
      if (!href) return;
      const fullUrl = resolveUrl(href, pageUrl);
      if (!fullUrl) return;

      listings.push({
        title: $(this).text().trim(),
        sourceUrl: fullUrl,
        originalUrl: fullUrl,
        sourceName: 'Wazifaha',
        sourceLanguage: 'en',
        jobType: 'job',
      });
    });

    // Pagination: find the maximum page number
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

    // Determine current page number
    const currentPageMatch = pageUrl.match(/[?&]page=(\d+)/);
    const currentPage = currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;

    if (maxPage > currentPage) {
      nextPage = resolveUrl(`?page=${currentPage + 1}`, pageUrl);
    }

    return { listings, nextPage };
  }

  /** Fetch the detail page and extract full listing data. */
  protected async parseDetail(listing: RawListing): Promise<RawListing> {
    try {
      const html = await this.fetchText(listing.sourceUrl);
      const $ = cheerio.load(html);

      // Title
      listing.title = this.text($('.wz-hero-title').first()) || listing.title;

      // Organization
      listing.organization = this.text($('.wz-hero-org a').first()) || null;

      // Logo
      const logoSrc = $('.wz-hero-logo img').first().attr('src');
      listing.logoUrl = logoSrc ? resolveUrl(logoSrc, listing.sourceUrl) : null;

      // Featured image — use logo as featured if no other image
      if (!listing.imageUrl && listing.logoUrl) {
        listing.imageUrl = listing.logoUrl;
      }

      // Extract all label-value pairs from the details grid
      const gridValues = this.extractGrid($);

      listing.location = gridValues.Location || null;
      listing.country = this.guessCountry(gridValues.Location) || null;
      listing.deadline = parseDate(gridValues['Closing Date']) || null;
      listing.salary = gridValues.Salary || null;
      listing.experience = gridValues.Experience || null;
      listing.educationReq = gridValues.Education || null;
      listing.category = gridValues.Category || null;
      listing.jobType = gridValues['Employment Type'] || listing.jobType;

      // Apply link
      const applyHref = $('a[href*="/jobs/apply/"]').first().attr('href');
      listing.applyUrl = applyHref ? resolveUrl(applyHref, listing.sourceUrl) : null;

      // Also check for external apply links in the content
      if (!listing.applyUrl) {
        const externalLink = this.findExternalApplyLink($);
        listing.applyUrl = externalLink;
      }

      // Description — combine all content sections
      const sections: string[] = [];
      $('.wz-content-card .wz-section-body').each(function () {
        const heading = $(this).prev('.wz-section-heading').text().trim();
        const body = $(this).html() || '';
        if (body.trim()) {
          sections.push(heading ? `<h3>${heading}</h3>\n${body}` : body);
        }
      });

      if (sections.length) {
        listing.description = sections.join('\n\n');
      }

      // Responsibilities / requirements / eligibility — try to extract from section headings
      const allSections = $('.wz-section-heading');
      allSections.each(function () {
        const heading = $(this).text().trim().toLowerCase();
        const body = $(this).next('.wz-section-body').html() || '';
        if (!body.trim()) return;

        if (heading.includes('requirement') || heading.includes('qualification')) {
          listing.requirements = stripHtml(body);
        } else if (heading.includes('responsib') || heading.includes('dut') || heading.includes('description')) {
          listing.responsibilities = stripHtml(body);
        } else if (heading.includes('eligib') || heading.includes('criteria')) {
          listing.eligibility = stripHtml(body);
        } else if (heading.includes('benefit') || heading.includes('compensation')) {
          listing.benefits = stripHtml(body);
        }
      });

      return listing;
    } catch (e) {
      // Return the partial listing from the list page
      console.error(`[wazifaha] detail parse error for ${listing.sourceUrl}:`, e);
      return listing;
    }
  }

  /** Extract all label-value pairs from `.wz-details-grid .wz-grid-item`. */
  private extractGrid($: cheerio.CheerioAPI): Record<string, string> {
    const result: Record<string, string> = {};
    $('.wz-details-grid .wz-grid-item').each(function () {
      const label = $(this).find('.wz-grid-label').text().trim();
      const value = $(this).find('.wz-grid-value').text().trim();
      if (label && value) {
        result[label] = value;
      }
    });
    return result;
  }

  /** Find an external apply link (e.g., Microsoft Forms, Google Forms). */
  private findExternalApplyLink($: cheerio.CheerioAPI): string | null {
    let externalUrl: string | null = null;
    $('a[href]').each(function () {
      const href = $(this).attr('href') || '';
      const text = $(this).text().trim().toLowerCase();
      // External form links
      if (
        (href.includes('forms.') || href.includes('docs.google.com') || href.includes('survey')) &&
        !href.startsWith('/')
      ) {
        externalUrl = href;
        return false; // break
      }
      // Links with "apply" text pointing externally
      if (text.includes('apply') && !href.startsWith('/') && !href.includes('wazifaha')) {
        externalUrl = href;
        return false; // break
      }
    });
    return externalUrl;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private text(el: any): string {
    return el.text().trim() || '';
  }

  /** Guess a country name from a location string. */
  private guessCountry(location?: string): string | null {
    if (!location) return null;
    const l = location.toLowerCase();
    if (l.includes('afghanistan') || l.includes('kabul') || l.includes('herat') ||
        l.includes('mazar') || l.includes('kandahar') || l.includes('paktia') ||
        l.includes('nangarhar') || l.includes('bamyan') || l.includes('kunduz')) {
      return 'Afghanistan';
    }
    return null;
  }
}
