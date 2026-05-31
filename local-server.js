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

function serve(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Cannot GET ' + filePath);
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];

  // Dynamic page route: /anything/ → anything.html
  const pageMatch = url.match(/^\/([a-z0-9_-]+)\/$/);
  if (pageMatch) {
    const pagePath = __dirname + '/' + pageMatch[1] + '.html';
    return fs.access(pagePath, fs.constants.F_OK, (err) => {
      serve(res, err ? __dirname + '/index.html' : pagePath);
    });
  }

  // Geo-location: try pre-rendered file first, fall back to index.html
  if (/^\/[a-z]{2}\//.test(url) && path.extname(url) === '') {
    const geoMatch = url.match(/^\/([a-z]{2})\/([^/]+)\/([^/]+)\/?$/);
    if (geoMatch) {
      const geoPath = __dirname + '/_geo/' + geoMatch[1] + '/' + geoMatch[2] + '/' + geoMatch[3] + '.html';
      return fs.access(geoPath, fs.constants.F_OK, (err) => {
        serve(res, err ? __dirname + '/index.html' : geoPath);
      });
    }
    return serve(res, __dirname + '/index.html');
  }

  // Static assets under geo paths → serve from root
  var geoAsset = url.match(/^\/[a-z]{2}\/[^/]+\/(.+)$/);
  if (geoAsset) {
    var rootPath = __dirname + '/' + geoAsset[1];
    return fs.access(rootPath, fs.constants.F_OK, function (err) {
      serve(res, err ? __dirname + '/index.html' : rootPath);
    });
  }

  // Serve file directly; default to index.html
  let filePath = __dirname + (url === '/' ? '/index.html' : url);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    serve(res, err ? __dirname + '/index.html' : filePath);
  });
});

server.listen(PORT, () => {
  console.log('Testing at http://127.0.0.1:' + PORT + '/');
});
