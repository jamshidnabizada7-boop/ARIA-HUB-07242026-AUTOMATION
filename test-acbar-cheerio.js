const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('acbar_jobs.html', 'utf-8');
const $ = cheerio.load(html);

const links = [];
$('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href) links.push(href);
});

console.log('All links containing "job":', [...new Set(links)].filter(l => l.includes('job')));
