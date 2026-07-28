const cheerio = require('cheerio');
async function main() {
  const res = await fetch('https://scholarships.af/opportunities/?job_type=scholarship', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const cards = .jobsearch-joblisting-classic-wrap;
  console.log('Found cards:', cards.length);
  if (cards.length > 0) {
    const card = cards.first();
    console.log('Title text:', card.find('.jobsearch-pst-title a').text().trim());
    console.log('Title href:', card.find('.jobsearch-pst-title a').attr('href'));
  } else {
    // Print what classes are inside jobsearch-joblisting-classic
    console.log(.jobsearch-joblisting-classic.html()?.substring(0, 500));
  }
}
main();
