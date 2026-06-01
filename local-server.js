const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];

  // Page routes: /anything/ → anything.html
  const pageMatch = url.match(/^\/([a-z0-9_-]+)\/$/);
  if (pageMatch) {
    const pagePath = path.join(__dirname, pageMatch[1] + '.html');
    return fs.access(pagePath, fs.constants.F_OK, (err) => {
      serveFile(res, err ? path.join(__dirname, 'index.html') : pagePath);
    });
  }

  // Serve file directly; default to index.html
  let filePath = path.join(__dirname, url === '/' ? '/index.html' : url);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    serveFile(res, err ? path.join(__dirname, 'index.html') : filePath);
  });
});

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Cannot GET ' + filePath);
      return;
    }
    res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8' });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log('Server running at http://127.0.0.1:' + PORT + '/');
});
