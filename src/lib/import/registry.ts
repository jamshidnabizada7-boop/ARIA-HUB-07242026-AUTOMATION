/**
 * Scraper registry.
 *
 * Maps a `scraperKey` (stored on each ImportSource row) to a BaseScraper
 * subclass constructor. To add support for a new website, create a scraper
 * class in `./scrapers/<name>.ts`, export it, and add one entry below.
 */

import type { BaseScraper } from './base-scraper';
import { WazifahaScraper } from './scrapers/wazifaha';
import { ScholarshipsAfScraper } from './scrapers/scholarships-af';

export const SCRAPERS: Record<string, new (...args: ConstructorParameters<typeof BaseScraper>) => BaseScraper> = {
  wazifaha: WazifahaScraper,
  scholarshipsAf: ScholarshipsAfScraper,
};

/**
 * Instantiate a scraper for a given source handle. Returns null if no
 * scraper is registered for the source's scraperKey.
 */
export function getScraper(source: ConstructorParameters<typeof BaseScraper>[0]): BaseScraper | null {
  const Ctor = SCRAPERS[source.scraperKey];
  return Ctor ? new Ctor(source) : null;
}
