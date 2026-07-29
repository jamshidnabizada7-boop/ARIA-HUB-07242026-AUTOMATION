import { ScholarshipsAfScraper } from '../src/lib/import/scrapers/scholarships-af';

async function main() {
  const scraper = new ScholarshipsAfScraper({ id: 'test', name: 'test', type: 'scholarship', baseUrl: 'https://scholarships.af/opportunities/?job_type=scholarship', scraper: 'ScholarshipsAfScraper', language: 'en', active: true, config: { maxPages: 1 } });
  console.log('Testing scholarships.af scraper...');
  const res = await scraper.scrapeAll();
  console.log('Found listings:', res.length);
  if (res.length > 0) {
    const detail = await (scraper as any).parseDetail(res[0]);
    console.log(detail);
  }
}
main().catch(console.error);
