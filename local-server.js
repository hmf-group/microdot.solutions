const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DOMAIN = 'https://microdot.solutions';
const DATE_MODIFIED = new Date().toISOString().split('T')[0];
const DATE_PUBLISHED = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

// Load all geo data at startup
const GEO_DATA = {};
const geoDir = path.join(__dirname, 'geo-data');
if (fs.existsSync(geoDir)) {
  fs.readdirSync(geoDir).filter(f => f.endsWith('.json')).forEach(file => {
    const cc = path.basename(file, '.json').toLowerCase();
    try {
      GEO_DATA[cc] = JSON.parse(fs.readFileSync(path.join(geoDir, file), 'utf-8'));
    } catch (e) {
      console.error('Failed to load ' + file, e.message);
    }
  });
}
console.log('Loaded ' + Object.keys(GEO_DATA).length + ' geo databases');

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function detectCountry(acceptLanguage) {
  if (!acceptLanguage) return 'lk';
  const langs = acceptLanguage.split(',').map(s => s.trim().split(';')[0]);
  for (const lang of langs) {
    const parts = lang.split('-');
    const cc = (parts[1] || parts[0] || '').toLowerCase();
    if (GEO_DATA[cc]) return cc;
  }
  return 'lk';
}

function renderLocation(html, loc, cc, page) {
  const provinceSlug = slugify(loc.state_province);
  const citySlug = slugify(loc.city);
  const origin = DOMAIN;

  let result = html;

  // Replace all {{variable}} placeholders
  const replacements = {
    '{{city}}': loc.city,
    '{{state_province}}': loc.state_province,
    '{{country}}': loc.country,
    '{{country_code}}': loc.country_code,
    '{{street_address}}': loc.street_address || '',
    '{{postal_code}}': loc.postal_code || '',
    '{{email}}': loc.email || '',
    '{{phone}}': loc.phone || '',
    '{{contactHeading}}': loc.contactHeading || '',
    '{{letsTalk}}': loc.letsTalk || '',
    '{{streetAddressLabel}}': loc.streetAddressLabel || '',
    '{{addressLocalityLabel}}': loc.addressLocalityLabel || '',
    '{{addressRegionLabel}}': loc.addressRegionLabel || '',
    '{{postalCodeLabel}}': loc.postalCodeLabel || '',
    '{{consultationTitle}}': loc.consultationTitle || '',
    '{{consultationLead}}': loc.consultationLead || '',
    '{{consultationInstruction}}': loc.consultationInstruction || '',
    '{{whatsappHeading}}': loc.whatsappHeading || '',
    '{{whatsappText}}': loc.whatsappText || '',
    '{{whatsappBtn}}': loc.whatsappBtn || '',
    '{{datePublished}}': DATE_PUBLISHED,
    '{{dateModified}}': DATE_MODIFIED,
    '{{updatedBadge}}': 'Updated ' + DATE_MODIFIED,
  };
  for (const [key, val] of Object.entries(replacements)) {
    result = result.split(key).join(val);
  }

  // Determine correct canonical & meta values per page
  function pageMeta(loc, cc, provinceSlug, citySlug) {
    const pageCanonicals = {
      'index.html': origin + '/' + cc + '/' + provinceSlug + '/' + citySlug + '/',
      'services.html': origin + '/services/',
      'contact.html': origin + '/contact/',
      'case-studies.html': origin + '/case-studies/',
      'why-us.html': origin + '/why-us/',
    };
    const canonical = pageCanonicals[page] || origin + '/';

    const descriptions = {
      'index.html': 'Pure HTML/CSS with native microdata schema markup. Zero bloat, perfect Core Web Vitals, lightning-fast delivery in ' + loc.city + ', ' + loc.state_province + '.',
      'services.html': 'Lightweight engineering, microdata integration, and performance audits in ' + loc.city + ', ' + loc.state_province + '. 100% framework-free HTML/CSS.',
      'contact.html': 'Contact Microdot in ' + loc.city + ', ' + loc.state_province + '. Email, phone, and WhatsApp. Start your light-speed web project today.',
      'case-studies.html': 'Real results from ' + loc.city + ', ' + loc.state_province + '. See how businesses achieved 100/100 PageSpeed and 340% traffic growth.',
      'why-us.html': 'Why Microdot in ' + loc.city + ', ' + loc.state_province + '. Zero-bloat HTML, native microdata, and light-speed performance for local businesses.',
    };
    const description = descriptions[page] || 'Microdot - ' + loc.city + ', ' + loc.state_province;

    return { canonical, description };
  }

  const meta = pageMeta(loc, cc, provinceSlug, citySlug);

  // Update title
  if (page === 'index.html') {
    result = result.replace(
      /<title>[^<]*<\/title>/,
      '<title>Max Performance Web Development in ' + loc.city + ' | Microdot</title>'
    );
  } else if (page === 'services.html') {
    result = result.replace(
      /<title>[^<]*<\/title>/,
      '<title>Web Development Services in ' + loc.city + ' | Microdot ' + loc.country_code + '</title>'
    );
  } else if (page === 'contact.html') {
    result = result.replace(
      /<title>[^<]*<\/title>/,
      '<title>Contact ' + loc.city + ' | Microdot ' + loc.country_code + '</title>'
    );
  } else if (page === 'case-studies.html') {
    result = result.replace(
      /<title>[^<]*<\/title>/,
      '<title>Case Studies in ' + loc.city + ' | Microdot ' + loc.country_code + '</title>'
    );
  } else if (page === 'why-us.html') {
    result = result.replace(
      /<title>[^<]*<\/title>/,
      '<title>Why Microdot? \u2014 ' + loc.city + ' | Microdot ' + loc.country_code + '</title>'
    );
  }

  // Update canonical
  result = result.replace(
    /<link rel="canonical" href="[^"]*"/,
    '<link rel="canonical" href="' + meta.canonical + '"'
  );

  // Update description meta
  result = result.replace(
    /<meta name="description"\s+content="[^"]*"/,
    '<meta name="description" content="' + meta.description + '"'
  );

  // Update keywords
  result = result.replace(
    /<meta name="keywords"\s+content="[^"]*"/,
    '<meta name="keywords" content="' + loc.city + ', ' + loc.state_province + ', ' + loc.country + ', web development, microdata, SEO, performance, Core Web Vitals"'
  );

  // Update subject
  result = result.replace(
    /<meta name="subject"\s+content="[^"]*"/,
    '<meta name="subject" content="Web Development Services in ' + loc.city + '"'
  );

  // Update url meta
  result = result.replace(
    /<meta name="url"\s+content="[^"]*"/,
    '<meta name="url" content="' + meta.canonical + '"'
  );

  // Update twitter:title
  result = result.replace(
    /<meta name="twitter:title"\s+content="[^"]*"/,
    '<meta name="twitter:title" content="Light-Speed HTML/CSS Websites in ' + loc.city + ' | Microdot"'
  );

  // Update twitter:description
  result = result.replace(
    /<meta name="twitter:description"\s+content="[^"]*"/,
    '<meta name="twitter:description" content="Zero framework bloat. 100% PageSpeed scores in ' + loc.city + ', ' + loc.state_province + '."'
  );

  // Update og:title
  result = result.replace(
    /<meta property="og:title"\s+content="[^"]*"/,
    '<meta property="og:title" content="Light-Speed HTML/CSS Websites in ' + loc.city + ' | Microdot"'
  );

  // Update og:url
  result = result.replace(
    /<meta property="og:url"\s+content="[^"]*"/,
    '<meta property="og:url" content="' + meta.canonical + '"'
  );

  // Update og:description
  result = result.replace(
    /<meta property="og:description"\s+content="[^"]*"/,
    '<meta property="og:description" content="Built with zero framework bloat. Pure HTML, lightweight CSS, and native microdata schemas engineered for 100% PageSpeed scores in ' + loc.city + ', ' + loc.state_province + '."'
  );

  // Update revised
  result = result.replace(
    /<meta name="revised"\s+content="[^"]*"/,
    '<meta name="revised" content="' + DATE_MODIFIED + '"'
  );

  // Update inline schema URLs
  result = result.replace(
    /(<link\s+itemprop="url"\s+href=")[^"]*(")/,
    '$1' + meta.canonical + '$2'
  );

  // Update schema areaServed name
  const areaNameRe = /(<div\s+itemprop="areaServed"[^>]*>[\s\S]*?<meta\s+itemprop="name"\s+content=")[^"]*(")/;
  result = result.replace(areaNameRe, '$1' + loc.city + '$2');

  // Update schema containedInPlace
  result = result.replace(
    /(<meta\s+itemprop="containedInPlace"\s+content=")[^"]*(")/,
    '$1' + loc.state_province + '$2'
  );

  // Inject JSON-LD before </head>
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'Microdot',
    'url': meta.canonical,
    'description': 'Max performance web development in ' + loc.city + ', ' + loc.country,
    'areaServed': {
      '@type': 'City',
      'name': loc.city,
      'containedInPlace': { '@type': 'State', 'name': loc.state_province }
    },
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'Microdot ' + loc.country_code,
      'image': 'https://microdot.solutions/assets/images/microdot.svg',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': loc.street_address || '',
        'addressLocality': loc.city,
        'addressRegion': loc.state_province,
        'postalCode': loc.postal_code || '',
        'addressCountry': loc.country_code
      },
      'email': loc.email || '',
      'telephone': loc.phone || '',
      'priceRange': '\u20AC\u20AC'
    }
  });
  result = result.replace('</head>',
    '<script type="application/ld+json">' + jsonLd + '</script>\n</head>'
  );

  return result;
}

function serveAndRender(res, filePath, req, page) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Cannot GET ' + filePath);
      return;
    }
    // For non-HTML, serve binary directly
    if (ext !== '.html') {
      res.writeHead(200, { 'Content-Type': mime });
      return res.end(data);
    }

    let html = data.toString();

    // If HTML has placeholders, do server-side geo replacement
    if (html.indexOf('{{') !== -1) {
      const cc = detectCountry(req.headers['accept-language']);
      const geoData = GEO_DATA[cc] || GEO_DATA['lk'] || [];
      const loc = geoData[0];
      if (loc) {
        html = renderLocation(html, loc, cc, page || path.basename(filePath));
      }
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
}

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];

  // Dynamic page route: /anything/ → anything.html
  const pageMatch = url.match(/^\/([a-z0-9_-]+)\/$/);
  if (pageMatch) {
    const pagePath = __dirname + '/' + pageMatch[1] + '.html';
    const pageFile = pageMatch[1] + '.html';
    return fs.access(pagePath, fs.constants.F_OK, (err) => {
      serveAndRender(res, err ? __dirname + '/index.html' : pagePath, req, err ? 'index.html' : pageFile);
    });
  }

  // Geo-location: try pre-rendered file first, fall back to index.html
  if (/^\/[a-z]{2}\//.test(url) && path.extname(url) === '') {
    const geoMatch = url.match(/^\/([a-z]{2})\/([^/]+)\/([^/]+)\/?$/);
    if (geoMatch) {
      const geoPath = __dirname + '/_geo/' + geoMatch[1] + '/' + geoMatch[2] + '/' + geoMatch[3] + '.html';
      return fs.access(geoPath, fs.constants.F_OK, (err) => {
        serveAndRender(res, err ? __dirname + '/index.html' : geoPath, req, err ? 'index.html' : null);
      });
    }
    return serveAndRender(res, __dirname + '/index.html', req, 'index.html');
  }

  // Static assets under geo paths → serve from root
  var geoAsset = url.match(/^\/[a-z]{2}\/[^/]+\/(.+)$/);
  if (geoAsset) {
    var rootPath = __dirname + '/' + geoAsset[1];
    return fs.access(rootPath, fs.constants.F_OK, function (err) {
      serveAndRender(res, err ? __dirname + '/index.html' : rootPath, req, err ? 'index.html' : null);
    });
  }

  // Serve file directly; default to index.html
  let filePath = __dirname + (url === '/' ? '/index.html' : url);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    serveAndRender(res, err ? __dirname + '/index.html' : filePath, req, err ? 'index.html' : url === '/' ? 'index.html' : null);
  });
});

server.listen(PORT, () => {
  console.log('Testing at http://127.0.0.1:' + PORT + '/');
});
