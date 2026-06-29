const https = require('https');

const token = 'b4id4DXfxDASt6a0KaSvMs75';

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: '/v9/projects',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
