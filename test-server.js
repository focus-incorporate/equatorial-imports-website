const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Equatorial Imports - Test</title>
      <style>
        body { font-family: Arial, sans-serif; background: #3d1712; color: #fef7e5; padding: 40px; text-align: center; }
        h1 { color: #fbdc9d; font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; line-height: 1.6; }
        .coffee { color: #f8c471; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>🌍 Equatorial Imports</h1>
      <p>Chasing the world's finest flavors to Seychelles</p>
      <p class="coffee">Your premium coffee website is ready!</p>
      <p>This is a test server to confirm connectivity works.</p>
      <hr style="margin: 40px 0; border: 1px solid #fbdc9d;">
      <p>Next.js server should be running on port 3002</p>
      <p>Try: <a href="http://localhost:3002" style="color: #f8c471;">http://localhost:3002</a></p>
    </body>
    </html>
  `);
});

server.listen(9000, () => {
  console.log('Test server running on http://localhost:9000');
});