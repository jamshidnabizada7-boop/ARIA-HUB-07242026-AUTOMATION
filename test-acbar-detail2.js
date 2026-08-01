const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('acbar_detail.html', 'utf-8');
const $ = cheerio.load(html);

const result = {};
$('.details p, .details div, .detail p, .row div').each((i, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if(text.includes(':')) {
        const parts = text.split(':');
        if (parts.length === 2 && parts[0].length < 30) {
           result[parts[0].trim()] = parts[1].trim();
        }
    }
});
console.log(result);
