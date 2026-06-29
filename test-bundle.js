const https = require('https');
https.get('https://sporthub10.vercel.app/_expo/static/js/web/entry-895c7b6c07529eff6568e7ddb19cb74d.js', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Contains Render URL?', body.includes('sporthub100-1.onrender.com'));
    console.log('Contains Local URL?', body.includes('192.168.126.198'));
  });
});
