const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

https.get('https://www.acbar.org/en/jobs/details/144516/senior-mining-extraction-engineer', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('acbar_detail.html', data);
    
    const $ = cheerio.load(data);
    const title = $('h1, h2, .job-title').first().text().trim();
    const result = { title };
    
    // Attempt to extract key-value pairs
    $('tr, .row, li').each((i, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if(text.includes(':')) {
           const parts = text.split(':');
           if (parts[0] && parts[1]) {
               result[parts[0].trim()] = parts[1].trim();
           }
        }
    });

    console.log(JSON.stringify(result, null, 2).substring(0, 500));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
