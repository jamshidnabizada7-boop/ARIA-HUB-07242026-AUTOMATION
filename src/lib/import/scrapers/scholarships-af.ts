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
  private fallbackUrl: string;

  constructor(source: any) {
    super(source);
    // Store the original HTML listing URL as a fallback
    this.fallbackUrl = 'https://scholarships.af/opportunities/?job_type=scholarship';
    // Prefer the sitemap for broader coverage
    if (this.source.baseUrl.includes('opportunities/?job_type=scholarship')) {
      this.source.baseUrl = 'https://scholarships.af/job-sitemap1.xml';
    }
  }

  /**
   * Override scrapeAll to fall back to HTML listing page if the sitemap
   * is unreachable (the site may block XML or be temporarily down).
   */
  async scrapeAll(): Promise<RawListing[]> {
    try {
      const results = await super.scrapeAll();
      if (results.length > 0) return results;
    } catch (e) {
      console.warn(`[scholarships.af] sitemap failed, falling back to HTML listing:`, e);
    }
    // Fallback: try the HTML listing page
    this.source.baseUrl = this.fallbackUrl;
    return super.scrapeAll();
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
            // Use the URL as the initial title so the pre-detail hash is stable and
            // unique. 'Unknown Title' would change to the real title on every re-run,
            // causing spurious "updated" counts on every scheduled scrape.
            listings.push({
              title: url,
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
  public async parseDetail(listing: RawListing): Promise<RawListing> {
    try {
      const html = await this.fetchText(listing.sourceUrl);
      const $ = cheerio.load(html);

      // ── Title ──────────────────────────────────────────────────────────────
      const pageTitle = $('title').text().trim();
      if (pageTitle) {
        listing.title = pageTitle.replace(/\s*[-–—]\s*Scholarships\.af\s*$/i, '').trim() || listing.title;
      }

      // ── Organization ───────────────────────────────────────────────────────
      const org = $('.careerfy-company-name a').first().text().trim();
      if (org) listing.organization = org.replace(/^@\s*/i, '').trim();

      // ── Service items (Gender, Level, Region, Medium, Field, Duration, etc.) ─
      const services = this.extractServices($);
      listing.extractedData = { ...services };
      
      if (services['Eligible Region/Countries']) {
        listing.eligibility = services['Eligible Region/Countries'];
      }
      if (services['Field of study']) {
        listing.category = services['Field of study'];
      }

      // ── Featured image / logo ──────────────────────────────────────────────
      const logoSrc = $('.careerfy-joblisting-media img, .careerfy-services-text img').first().attr('src');
      if (logoSrc) {
        const url = resolveUrl(logoSrc, listing.sourceUrl);
        if (!listing.imageUrl) listing.imageUrl = url;
        if (!listing.logoUrl) listing.logoUrl = url;
      }

      // All rich content is usually inside .jobsearch-description
      let descEl = $('.jobsearch-description').first().clone();
      if (!descEl.length || descEl.text().length < 100) {
        descEl = $('.text-content, .entry-content, .post-content').first().clone();
      }
      descEl.find('script, ins.adsbygoogle, .code-block, .code-block-label').remove();

      // Parse h2-delimited sections from the description
      this.parseDescriptionSections($, descEl, listing);

      // ── Deadline from Key Details or description text ──────────────────────
      if (!listing.deadline) {
        listing.deadline = this.extractDeadlineFromKeyDetails(listing.extractedData) ||
                           this.extractDeadlineFromText(descEl.text());
      }

      // ── Apply link ─────────────────────────────────────────────────────────
      const applyUrl = this.findApplyLink($);
      if (applyUrl) listing.applyUrl = applyUrl;

      return listing;
    } catch (e) {
      console.error(`[scholarships.af] detail parse error for ${listing.sourceUrl}:`, e);
      return listing;
    }
  }

  /**
   * Parse the .jobsearch-description into h2-delimited sections.
   * Maps each section (Benefits, Eligibility, Required Documents, How to Apply, etc.)
   * to the correct RawListing field. Non-matched sections become the main description.
   */
  private parseDescriptionSections(
    $: cheerio.CheerioAPI,
    descEl: any,
    listing: RawListing,
  ): void {
    const descHtml = descEl.html() || '';
    if (!descHtml.trim()) return;

    // Split the description by <h2> headings into named sections
    const sections: Array<{ heading: string; body: string }> = [];
    // Regex to split by h2 tags, capturing the heading text
    const h2Pattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
    const parts = descHtml.split(h2Pattern);

    // parts[0] = content before the first h2 (the main description)
    // parts[1] = first h2 heading text, parts[2] = content after first h2
    // parts[3] = second h2 heading text, parts[4] = content after second h2, etc.

    const mainDescParts: string[] = [];
    if (parts[0]?.trim()) {
      mainDescParts.push(parts[0].trim());
    }

    for (let i = 1; i < parts.length; i += 2) {
      const heading = stripHtml(parts[i] || '').trim().toLowerCase();
      const bodyHtml = (parts[i + 1] || '').trim();
      if (!heading || !bodyHtml) continue;

      // Strip trailing ads/related blocks from body
      const cleanBody = this.stripTrailingJunk(bodyHtml);
      const bodyText = stripHtml(cleanBody);
      if (!bodyText.trim()) continue;

      // Map heading → RawListing field
      if (heading.includes('key detail') || heading.includes('dates')) {
        // Parse key details as structured data into extractedData
        this.parseKeyDetails(cleanBody, listing);
      } else if (heading.includes('benefit') || heading.includes('financial aid')) {
        listing.benefits = bodyText;
      } else if (heading.includes('eligib') || heading.includes('criteria')) {
        listing.eligibility = listing.eligibility
          ? `${listing.eligibility}\n\n${bodyText}` : bodyText;
      } else if (heading.includes('required document')) {
        listing.requirements = bodyText;
      } else if (heading.includes('selection process')) {
        // Store in extractedData as supplementary info
        if (!listing.extractedData) listing.extractedData = {};
        listing.extractedData['Selection Process'] = bodyText;
        // Also append to requirements
        listing.requirements = listing.requirements
          ? `${listing.requirements}\n\nSelection Process:\n${bodyText}` : `Selection Process:\n${bodyText}`;
      } else if (heading.includes('how to apply') || heading.includes('submission') || heading.includes('guideline')) {
        listing.guidelines = bodyText;
      } else if (heading.includes('check more') || heading.includes('related') ||
                 heading.includes('other opportunit')) {
        // Skip related links / footer sections entirely
        continue;
      } else {
        // Any other section (e.g., "Opportunity Description") → main description
        mainDescParts.push(`<h3>${stripHtml(parts[i] || '').trim()}</h3>\n${cleanBody}`);
      }
    }

    // Assemble the main description from non-extracted parts
    if (mainDescParts.length) {
      listing.description = cleanHtmlWhitespace(mainDescParts.join('\n\n'));
    } else if (!listing.description && !listing.requirements && !listing.eligibility && !listing.benefits) {
      // If we couldn't parse ANY sections successfully, just use the entire clean body as the description
      // to prevent "short details" bug.
      const rawText = descEl.text().trim();
      if (rawText.length > 50) {
        listing.description = cleanHtmlWhitespace(descHtml);
      }
    }
  }

  /**
   * Parse the "Key Details and Dates" section.
   * This section contains structured bullet points like:
   *   - Application Deadline: 2 May 2027
   *   - Host Country: Sweden
   *   - Study Level: Bachelor's and Master's
   */
  private parseKeyDetails(bodyHtml: string, listing: RawListing): void {
    const $ = cheerio.load(`<div>${bodyHtml}</div>`);
    if (!listing.extractedData) listing.extractedData = {};
    
    $('li').each(function () {
      const text = $(this).text().trim();
      // Try to split on colon or first bold text
      const strong = $(this).find('strong, b').first().text().trim();
      if (strong) {
        const key = strong.replace(/:?\s*$/, '').trim();
        const value = text.replace(strong, '').replace(/^[:\s]+/, '').trim();
        if (key && value) {
          listing.extractedData![key] = value;
        }
      }
    });

    // Map known key details to listing fields
    const ed = listing.extractedData;
    if (ed['Application Deadline'] || ed['Deadline']) {
      listing.deadline = parseDate(ed['Application Deadline'] || ed['Deadline']) || null;
    }
    if (ed['Host Country']) {
      listing.country = ed['Host Country'];
    }
    if (ed['Funding Type']) {
      listing.scholarshipType = ed['Funding Type'];
    }
    if (ed['Duration']) {
      // Prefer Key Details duration over services duration
      ed['Duration'] = ed['Duration'];
    }
    if (ed['Study Level']) {
      listing.educationReq = ed['Study Level'];
    }
    if (ed['Host Institution']) {
      if (!listing.organization) listing.organization = stripHtml(ed['Host Institution']);
    }
    if (ed['Program Language']) {
      // Store as extracted data (already there)
    }
  }

  /** Extract label-value pairs from `.careerfy-jobdetail-services li`. */
  private extractServices($: cheerio.CheerioAPI): Record<string, string> {
    const result: Record<string, string> = {};
    $('.careerfy-jobdetail-services li').each(function () {
      const label = $(this).find('.careerfy-services-text span').first().text().trim();
      // Collect ALL small values (e.g., Gender: Male, Female)
      const smallValues: string[] = [];
      $(this).find('.careerfy-services-text small').each(function () {
        const v = $(this).text().trim();
        if (v) smallValues.push(v);
      });
      // Also check for div content (e.g., Eligible Region/Countries uses a div)
      const divValue = $(this).find('.careerfy-services-text > div').first().text().trim();
      
      const value = smallValues.length > 0
        ? smallValues.join(', ')
        : divValue || '';
      
      if (label && value) {
        result[label.replace(/:?\s*$/, '').trim()] = value;
      }
    });
    return result;
  }

  /** Find the external apply URL (Apply Now button or external link). */
  private findApplyLink($: cheerio.CheerioAPI): string | null {
    let url: string | null = null;
    // Priority 1: explicit apply button
    $('a').each(function () {
      const href = $(this).attr('href') || '';
      const text = $(this).text().trim().toLowerCase();
      const cls = $(this).attr('class') || '';
      if (
        (text.includes('apply now') || text.includes('apply for') ||
         cls.includes('apply') || text.includes('official') && text.includes('website')) &&
        href && !href.startsWith('javascript') && href !== '#' &&
        !href.includes('scholarships.af')
      ) {
        url = href;
        return false; // break
      }
    });
    return url;
  }

  /** Extract deadline from the Key Details extractedData. */
  private extractDeadlineFromKeyDetails(data?: Record<string, unknown>): string | null {
    if (!data) return null;
    const raw = (data['Application Deadline'] || data['Deadline']) as string;
    if (!raw) return null;
    return parseDate(raw) || null;
  }

  /** Pull a date from description text mentioning "Deadline". */
  private extractDeadlineFromText(text: string): string | null {
    // Match patterns like "Application Deadline 2 May 2027" or "Deadline: Aug 15, 2026"
    const patterns = [
      /application\s*deadline[:\s]*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
      /deadline[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    ];
    for (const pat of patterns) {
      const m = text.match(pat);
      if (m) return parseDate(m[1]) || null;
    }
    return null;
  }

  /**
   * Strip trailing junk from section body HTML (related listings, social links,
   * "Check More Scholarships", etc.)
   */
  private stripTrailingJunk(html: string): string {
    const cutPhrases = [
      'Check More Scholarships',
      'Other Opportunities You May Like',
      'Other Opportunities you may like',
      'Related Opportunities',
      'Frequently Asked Questions',
    ];
    let result = html;
    for (const phrase of cutPhrases) {
      const idx = result.indexOf(phrase);
      if (idx !== -1) {
        const blockStart = result.lastIndexOf('<', idx);
        result = result.substring(0, blockStart !== -1 ? blockStart : idx);
      }
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private text(el: any): string {
    return el.text().trim() || '';
  }
}

