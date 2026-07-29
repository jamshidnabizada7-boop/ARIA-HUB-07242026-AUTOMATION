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
import { resolveUrl, stripHtml, parseDate, cleanHtmlWhitespace } from '../utils';
import type { RawListing, ScrapePage } from '../types';

export class ScholarshipsAfScraper extends BaseScraper {
  constructor(source: any) {
    super(source);
    // Automatically upgrade the old URL to the sitemap URL
    if (this.source.baseUrl.includes('opportunities/?job_type=scholarship')) {
      this.source.baseUrl = 'https://scholarships.af/job-sitemap1.xml';
    }
  }

  /**
   * Parse the listing page. Each card links to a detail page
   * `/opportunity/<slug>/` which `parseDetail()` enriches.
   */
  protected async parseListPage(html: string, pageUrl: string): Promise<ScrapePage> {
    const $ = cheerio.load(html, { xmlMode: html.trim().startsWith('<?xml') || html.includes('<urlset') });
    const listings: RawListing[] = [];
    console.log('HTML/XML Length:', html.length, 'URL:', pageUrl);

    if (html.trim().startsWith('<?xml') || html.includes('<urlset') || html.includes('<sitemapindex')) {
      // It's a sitemap!
      if (html.includes('<urlset')) {
        // Individual sitemap with URLs
        $('loc').each(function () {
          const url = $(this).text().trim();
          if (url && url.includes('/opportunity/')) {
            listings.push({
              title: 'Unknown Title', // Will be populated in parseDetail
              sourceUrl: url,
              originalUrl: url,
              sourceName: 'Scholarships.af',
              sourceLanguage: 'en',
              category: 'scholarship',
            });
          }
        });
      }
      return { listings, nextPage: null };
    }

    // Standard HTML parse fallback
    $('.jobsearch-joblisting-classic-wrap').each(function () {
      const card = $(this);
      const titleLink = card.find('.jobsearch-pst-title a').first();
      const href = titleLink.attr('href') || '';
      const fullUrl = resolveUrl(href, pageUrl);
      if (!fullUrl) return;

      const title = titleLink.attr('title')?.trim() || titleLink.text().trim();
      const orgText = card.find('.job-company-name a').first().text().trim();
      const organization = orgText.replace(/^@\s*/i, '').trim() || null;
      const imgSrc = card.find('figure img').first().attr('src') || null;
      const imageUrl = imgSrc ? resolveUrl(imgSrc, pageUrl) : null;
      const typeBtn = card.find('.jobsearch-option-btn').first().text().trim();
      const jobType = typeBtn ? typeBtn.toLowerCase() : 'scholarship';

      let deadline: string | null = null;
      card.find('li').each(function () {
        const li = $(this).text().trim();
        if (/deadline/i.test(li) && !deadline) {
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

    let nextPage: string | null = null;
    if (listings.length > 0) {
      const pageMatch = pageUrl.match(/\/page\/(\d+)/);
      if (pageMatch) {
        const nextNum = parseInt(pageMatch[1], 10) + 1;
        if (nextNum <= 10) {
          nextPage = pageUrl.replace(/\/page\/\d+/, `/page/${nextNum}`);
        }
      } else {
        const urlObj = new URL(pageUrl);
        let path = urlObj.pathname;
        if (!path.endsWith('/')) path += '/';
        path += 'page/2/';
        nextPage = `${urlObj.origin}${path}${urlObj.search}`;
      }
    }

    return { listings, nextPage };
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

      // Extract eligibility / benefits sections from headings in description (and remove them from descEl)
      this.extractSections(descEl, listing);

      let descHtml = descEl.html() || '';
      
      // Defensively remove unwanted footer/related blocks if they get caught in the description
      const stripAfter = [
        'Frequently Asked Questions',
        'Other Opportunities You May Like',
        'Other Opportunities you may like',
        'Follow Us:',
        'Facebook',
        'YouTube',
        'Telegram',
        'Instagram',
        'WhatsApp',
        'Scholarship for Afghanistan — Making Education',
        'Scholarship for Afghanistan',
        'scholarships.af · o4af.com',
        'scholarships.af  o4af.com'
      ];
      for (const phrase of stripAfter) {
        const idx = descHtml.indexOf(phrase);
        if (idx !== -1) {
          // Find the start of the current block (e.g., <p> or <div>) before the phrase
          const blockStart = descHtml.lastIndexOf('<', idx);
          descHtml = descHtml.substring(0, blockStart !== -1 ? blockStart : idx);
        }
      }

      if (descHtml.trim()) {
        listing.description = cleanHtmlWhitespace(descHtml.trim());
      }

      // Extract deadline + key details from description if not already set
      if (!listing.deadline) {
        listing.deadline = this.extractDeadlineFromText(descEl.text());
      }

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
    const selectors = 'h2, h3, h4, p:has(strong), p:has(b), strong, b';
    
    // We must find elements in order and process them. Since we might mutate the DOM,
    // we collect all matching headers first, but process them carefully.
    $desc.find(selectors).each(function (this: any) {
      const $h = $desc.find(this);
      // Skip if this element was already removed or is a descendant of a matched header
      if (!$h.closest('body').length && $desc.find($h).length === 0) return;
      
      const heading = $h.text().trim().toLowerCase();
      if (!heading || heading.length > 80) return; // Ignore very long bold text

      const $container = $h.parent().is('p') ? $h.parent() : $h;
      const matched = $container.nextUntil(selectors);
      const subBody = matched.toArray().map((el: any) => {
        // use cheerios html on each element
        const tag = (el.tagName || '').toLowerCase();
        // If it's a text node or similar without prop/html, just use text
        return $desc.find(el).prop('outerHTML') || $desc.find(el).html() || $desc.find(el).text();
      }).join('<br>');
      
      if (!subBody.trim()) return;
      const body = stripHtml(subBody);
      let isExtracted = false;

      if (heading.includes('eligib')) {
        listing.eligibility = listing.eligibility ? `${listing.eligibility}\n\n${body}` : body;
        isExtracted = true;
      } else if (heading.includes('benefit') || heading.includes('funding') ||
                 (heading.includes('cover') && heading.includes('what'))) {
        listing.benefits = listing.benefits ? `${listing.benefits}\n\n${body}` : body;
        isExtracted = true;
      } else if (heading.includes('require') || heading.includes('document')) {
        listing.requirements = listing.requirements ? `${listing.requirements}\n\n${body}` : body;
        isExtracted = true;
      } else if (heading.includes('responsib') || heading.includes('dut') || heading.includes('role')) {
        listing.responsibilities = listing.responsibilities ? `${listing.responsibilities}\n\n${body}` : body;
        isExtracted = true;
      } else if (heading.includes('submission') || heading.includes('apply') || heading.includes('guideline')) {
        listing.guidelines = listing.guidelines ? `${listing.guidelines}\n\n${body}` : body;
        isExtracted = true;
      }

      if (isExtracted) {
        matched.remove();
        $container.remove();
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private text(el: any): string {
    return el.text().trim() || '';
  }
}
