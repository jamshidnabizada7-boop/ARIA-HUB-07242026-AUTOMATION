const fs = require('fs');
const https = require('https');

https.get('https://www.acbar.org/en/jobs?page=1', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('acbar_jobs.html', data);
    console.log('done');
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
