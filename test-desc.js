const cheerio = require('d:/ARIA-HUB-07242026-AUTOMATION-main (1)/ARIA-HUB-07242026-AUTOMATION-main/node_modules/cheerio');
async function main() {
  const res = await fetch("https://scholarships.af/opportunity/oxford-pershing-square-graduate-scholarship/");
  const html = await res.text();
  const $ = cheerio.load(html);
  const descEl = .jobsearch-description.first().clone();
  console.log('Original description HTML length:', descEl.html().length);
  
  // Search for "Other Opportunities"
  const other = descEl.find(':contains("Other Opportunities")');
  console.log('Found "Other Opportunities":', other.length > 0);
  if (other.length > 0) {
    console.log('Other Opps classes:', other.last().parent().attr('class'), other.last().attr('class'));
  }

  // Search for "Follow Us"
  const follow = descEl.find(':contains("Follow Us:")');
  console.log('Found "Follow":', follow.length > 0);
  if (follow.length > 0) {
    console.log('Follow classes:', follow.last().parent().attr('class'), follow.last().attr('class'));
  }
}
main();
