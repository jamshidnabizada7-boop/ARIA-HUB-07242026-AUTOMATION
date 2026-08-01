/**
 * ACBAR Job Scraper
 *
 * Source: https://www.acbar.org/en/jobs
 * Method: HTML scraping via cheerio
 */

import * as cheerio from 'cheerio';
import { BaseScraper } from '../base-scraper';
import { resolveUrl, cleanHtmlWhitespace } from '../utils';
import type { RawListing, ScrapePage } from '../types';

export class AcbarScraper extends BaseScraper {
  constructor(source: any) {
    super(source);
    if (!this.source.config) this.source.config = {};
    if (!this.source.config.maxPages) this.source.config.maxPages = 30; // ACBAR has about 15-20 pages typically
  }

  /** Parse the list page. */
  protected async parseListPage(html: string, pageUrl: string): Promise<ScrapePage> {
    const $ = cheerio.load(html);
    const listings: RawListing[] = [];

    // Find all links containing 'jobs/details'
    const seenHrefs = new Set<string>();
    $('a').each(function () {
      const href = $(this).attr('href');
      if (!href || !href.includes('jobs/details')) return;
      
      if (seenHrefs.has(href)) return;
      seenHrefs.add(href);

      const fullUrl = resolveUrl(href, pageUrl);
      if (!fullUrl) return;

      const title = $(this).text().replace(/\s+/g, ' ').trim() || 'ACBAR Job Opportunity';

      listings.push({
        title: title.length > 5 ? title : 'ACBAR Job Opportunity', // prevent empty or extremely short titles
        sourceUrl: fullUrl,
        originalUrl: fullUrl,
        sourceName: 'ACBAR',
        sourceLanguage: 'en',
        jobType: 'job',
      });
    });

    // Pagination
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

  /** Fetch the detail page and extract full listing data. */
  public async parseDetail(listing: RawListing): Promise<RawListing> {
    try {
      const html = await this.fetchText(listing.sourceUrl);
      const $ = cheerio.load(html);

      // Extract better title if possible
      const h1Title = $('h1').first().text().trim();
      if (h1Title && h1Title.length > 5) {
        listing.title = h1Title;
      } else {
        const h2Title = $('h2').first().text().trim();
        if (h2Title && h2Title.length > 5) {
            listing.title = h2Title;
        }
      }

      // Extract key-value pairs (Location, Organization, etc.) from standard divs or lists
      const extracted: Record<string, string> = {};
      $('tr, .row, li, p, div').each(function () {
        const text = $(this).text().replace(/\s+/g, ' ').trim();
        if (text.includes(':') && text.length < 150) {
          const parts = text.split(':');
          const key = parts[0].trim();
          const value = parts.slice(1).join(':').trim();
          if (key && value && key.split(' ').length < 5) {
            extracted[key] = value;
          }
        }
      });

      listing.extractedData = extracted;

      // Map extracted data to known fields if possible
      const keys = Object.keys(extracted);
      for (const k of keys) {
        const lower = k.toLowerCase();
        if (lower.includes('organization') || lower.includes('company')) {
            listing.organization = listing.organization || extracted[k];
        } else if (lower.includes('location') || lower.includes('city') || lower.includes('province')) {
            listing.location = listing.location || extracted[k];
        } else if (lower.includes('salary')) {
            listing.salary = listing.salary || extracted[k];
        } else if (lower.includes('experience')) {
            listing.experience = listing.experience || extracted[k];
        } else if (lower.includes('education')) {
            listing.educationReq = listing.educationReq || extracted[k];
        } else if (lower.includes('vacancy')) {
            // Can be useful context
        }
      }

      listing.country = 'Afghanistan'; // ACBAR is Afghanistan focused

      // Try to find the description container
      // ACBAR usually has a main container with the text
      let descHtml = '';
      if ($('.job-detail, .job-description, .description').length) {
          descHtml = $('.job-detail, .job-description, .description').html() || '';
      } else {
          // Fallback to body content excluding header/footer
          descHtml = $('main, .container, body').html() || '';
      }
      
      if (descHtml) {
        listing.description = cleanHtmlWhitespace(descHtml);
      }

      // External apply links
      let externalUrl: string | null = null;
      $('a[href]').each(function () {
        const href = $(this).attr('href') || '';
        const text = $(this).text().trim().toLowerCase();
        if (
          (href.includes('forms.') || href.includes('docs.google.com') || href.includes('survey')) &&
          !href.startsWith('/')
        ) {
          externalUrl = href;
          return false;
        }
      });
      if (externalUrl) {
          listing.applyUrl = externalUrl;
      }

      return listing;
    } catch (e) {
      console.error(`[acbar] detail parse error for ${listing.sourceUrl}:`, e);
      return listing;
    }
  }
}
