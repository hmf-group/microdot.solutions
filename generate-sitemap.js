const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://microdot.solutions';
const GEO_DIR = path.join(__dirname, 'geo-data');
const OUTPUT = path.join(__dirname, 'sitemap.xml');

const PAGE_ROUTES = ['services', 'contact', 'case-studies', 'why-us', 'privacy', 'terms', 'next-gen-web-development', 'semantic-web-development-company', 'web-development-agency', 'fast-microdata-web-development', 'high-speed-html-web-development', 'ai-ready-web-development', 'worldwide-microdata-development', 'usa-microdata-website-developer', 'uk-microdata-web-development', 'europe-structured-data-agency', 'asia-pacific-microdata-experts', 'middle-east-schema-markup', 'latin-america-microdata-web-development'];

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const urls = [];

// Root
urls.push({ loc: DOMAIN + '/', priority: '1.0', changefreq: 'weekly' });

// Page routes
PAGE_ROUTES.forEach(function(route) {
  urls.push({ loc: DOMAIN + '/' + route + '/', priority: '0.9', changefreq: 'monthly' });
});

// Geo-location URLs
var files = fs.readdirSync(GEO_DIR).filter(function(f) { return f.endsWith('.json'); });
files.forEach(function(file) {
  var cc = path.basename(file, '.json').toLowerCase();
  var data = JSON.parse(fs.readFileSync(path.join(GEO_DIR, file), 'utf-8'));
  data.forEach(function(loc) {
    var provinceSlug = slugify(loc.state_province);
    var citySlug = slugify(loc.city);
    urls.push({
      loc: DOMAIN + '/' + cc + '/' + provinceSlug + '/' + citySlug + '/',
      priority: '0.8',
      changefreq: 'monthly'
    });
  });
});

// Build XML
var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
urls.forEach(function(u) {
  xml += '  <url>\n';
  xml += '    <loc>' + u.loc + '</loc>\n';
  xml += '    <changefreq>' + u.changefreq + '</changefreq>\n';
  xml += '    <priority>' + u.priority + '</priority>\n';
  xml += '  </url>\n';
});
xml += '</urlset>\n';

fs.writeFileSync(OUTPUT, xml, 'utf-8');
console.log('sitemap.xml generated with ' + urls.length + ' URLs');
