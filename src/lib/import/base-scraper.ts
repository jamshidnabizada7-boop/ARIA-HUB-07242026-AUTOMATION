/**
 * BaseScraper — abstract foundation for all import scrapers.
 *
 * Subclasses implement `parseListPage()` and (optionally) `parseDetail()`.
 * Adding a new source website = create one subclass + register it in
 * `registry.ts`. Everything else (fetching, retries, pagination, crawl delay,
 * caching) is handled here.
 */

import { DEFAULT_USER_AGENT, sanitizeError, sleep } from './utils';
import type { FetchOptions, RawListing, ScrapePage, SourceHandle } from './types';

/** In-memory cache keyed by URL: stores body + etag to avoid refetching. */
interface CacheEntry { body: string; etag?: string; at: number; }
const fetchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export abstract class BaseScraper {
  constructor(protected source: SourceHandle) {}

  /** Parse a single page of the source's list view. Must return nextPage (abs URL or null). */
  protected abstract parseListPage(html: string, pageUrl: string): Promise<ScrapePage> | ScrapePage;

  /**
   * Optionally fetch and parse the detail page for a listing to enrich it
   * (full description, eligibility, etc.). Default: no-op (return as-is).
   */
  protected async parseDetail(listing: RawListing): Promise<RawListing> {
    return listing;
  }

  /**
   * Fetch HTML/text from a URL with retries, timeout, crawl-delay, and caching.
   * Throws on final failure so the caller can record a per-listing error.
   */
  async fetchText(url: string, opts: FetchOptions = {}): Promise<string> {
    const retries = opts.retries ?? 2;
    const timeoutMs = opts.timeoutMs ?? this.source.config.timeoutMs ?? 30_000;
    const delay = opts.crawlDelayMs ?? this.source.config.crawlDelayMs ?? 1500;

    const cached = fetchCache.get(url);
    const fresh = cached && Date.now() - cached.at < CACHE_TTL_MS;
    if (fresh) return cached.body;

    let lastErr: unknown;
    const headers: Record<string, string> = {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en,fa;q=0.9,ps;q=0.8',
      ...(opts.headers || {}),
    };
    if (cached?.etag) headers['If-None-Match'] = cached.etag;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { headers, signal: controller.signal, redirect: 'follow' });
        if (res.status === 304 && cached) return cached.body;
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const body = await res.text();
        fetchCache.set(url, { body, etag: res.headers.get('etag') || undefined, at: Date.now() });
        await sleep(delay); // respect the source
        return body;
      } catch (e) {
        lastErr = e;
        // Exponential backoff: 500ms, 1s, 2s...
        if (attempt < retries) await sleep(500 * Math.pow(2, attempt));
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error(`Fetch failed for ${url}: ${sanitizeError(lastErr)}`);
  }

  /** Fetch and parse JSON (used by API-based scrapers like WordPress REST). */
  async fetchJson<T = unknown>(url: string, opts: FetchOptions = {}): Promise<{ data: T; headers: Headers }> {
    const retries = opts.retries ?? 2;
    const timeoutMs = opts.timeoutMs ?? this.source.config.timeoutMs ?? 30_000;
    const delay = opts.crawlDelayMs ?? this.source.config.crawlDelayMs ?? 1000;
    const headers: Record<string, string> = {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': 'application/json',
      ...(opts.headers || {}),
    };

    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { headers, signal: controller.signal, redirect: 'follow' });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = (await res.json()) as T;
        await sleep(delay);
        return { data, headers: res.headers };
      } catch (e) {
        lastErr = e;
        if (attempt < retries) await sleep(500 * Math.pow(2, attempt));
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error(`Fetch failed for ${url}: ${sanitizeError(lastErr)}`);
  }

  /**
   * Crawl all listing pages up to maxPages, optionally enriching each listing
   * via its detail page. Returns the full flattened set of listings.
   */
  async scrapeAll(): Promise<RawListing[]> {
    const maxPages = this.source.config.maxPages ?? 5;
    const all: RawListing[] = [];
    let nextUrl: string | null | undefined = this.source.baseUrl;

    for (let page = 0; page < maxPages && nextUrl; page++) {
      let page: ScrapePage;
      try {
        const body = await this.fetchText(nextUrl);
        page = await this.parseListPage(body, nextUrl);
      } catch (e) {
        // Record the page failure but keep going with whatever we have.
        console.error(`[import] list page failed (${nextUrl}):`, sanitizeError(e));
        break;
      }

      if (!page.listings.length) break;

      // Optionally fetch detail pages (sequential + polite).
      if (this.source.config.detailFetch !== false) {
        for (const listing of page.listings) {
          try {
            const enriched = await this.parseDetail(listing);
            Object.assign(listing, enriched);
          } catch (e) {
            console.error(`[import] detail failed (${listing.sourceUrl}):`, sanitizeError(e));
            // keep the partial listing from the list page
          }
        }
      }

      all.push(...page.listings);
      nextUrl = page.nextPage || null;
    }

    return all;
  }
}
