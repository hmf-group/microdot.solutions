const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://microdot.solutions';
const GEO_DIR = path.join(__dirname, 'geo-data');
const OUTPUT_DIR = path.join(__dirname, '_geo');
const DATE_PUBLISHED = new Date().toISOString().split('T')[0];
const DATE_MODIFIED = DATE_PUBLISHED;

const TEMPLATES = [
  {
    file: 'index.html',
    titleTemplate: (loc) => 'Max Performance Web Development in ' + loc.city + ' | Microdot',
    canonical: (loc, cc, provinceSlug, citySlug) => DOMAIN + '/' + cc + '/' + provinceSlug + '/' + citySlug + '/',
    meta: (loc, cc, provinceSlug, citySlug, origin) => ({
      'description': loc.city + ', ' + loc.state_province,
      'keywords': loc.city + ', ' + loc.state_province + ', ' + loc.country,
      'subject': 'Web Development Services in ' + loc.city,
      'url': origin + '/' + cc + '/' + provinceSlug + '/' + citySlug + '/',
      'twitter:title': 'Light-Speed HTML/CSS Websites in ' + loc.city + ' | Microdot',
      'twitter:description': 'Zero framework bloat. 100% PageSpeed scores in ' + loc.city + ', ' + loc.state_province + '.',
      'og:title': 'Light-Speed HTML/CSS Websites in ' + loc.city + ' | Microdot',
      'og:url': origin + '/' + cc + '/' + provinceSlug + '/' + citySlug + '/',
      'og:description': 'Built with zero framework bloat. Pure HTML, lightweight CSS, and native microdata schemas engineered for 100% PageSpeed scores in ' + loc.city + ', ' + loc.state_province + '.'
    })
  },
  {
    file: 'services.html',
    titleTemplate: (loc) => 'Web Development Services in ' + loc.city + ' | Microdot ' + loc.country_code,
    canonical: () => DOMAIN + '/services/',
    meta: (loc, cc, provinceSlug, citySlug, origin) => ({
      'description': 'Lightweight engineering, microdata integration, and performance audits in ' + loc.city + ', ' + loc.state_province + '. 100% framework-free HTML/CSS.',
      'keywords': loc.city + ', ' + loc.state_province + ', ' + loc.country + ', web development, microdata, SEO, performance, Core Web Vitals',
      'subject': 'Web Development Services in ' + loc.city,
      'url': origin + '/services/',
      'twitter:title': 'Web Development Services in ' + loc.city + ' | Microdot',
      'twitter:description': 'Lightweight engineering, microdata, and audits in ' + loc.city + ', ' + loc.state_province + '. 100% PageSpeed guaranteed.',
      'og:title': 'Web Development Services in ' + loc.city + ' | Microdot',
      'og:url': origin + '/services/',
      'og:description': 'Lightweight engineering, microdata integration, and performance audits in ' + loc.city + ', ' + loc.state_province + '. 100% framework-free.'
    })
  },
  {
    file: 'contact.html',
    titleTemplate: (loc) => 'Contact ' + loc.city + ' | Microdot ' + loc.country_code,
    canonical: () => DOMAIN + '/contact/',
    meta: (loc, cc, provinceSlug, citySlug, origin) => ({
      'description': 'Contact Microdot in ' + loc.city + ', ' + loc.state_province + '. Email, phone, and WhatsApp. Start your light-speed web project today.',
      'keywords': 'web development, microdata, SEO, ' + loc.city + ', ' + loc.state_province + ', ' + loc.country + ', contact',
      'subject': 'Contact Microdot in ' + loc.city,
      'url': origin + '/contact/',
      'twitter:title': 'Contact Microdot \u2014 ' + loc.city,
      'twitter:description': 'Contact Microdot in ' + loc.city + ', ' + loc.state_province + '. Email, phone, and WhatsApp.',
      'og:title': 'Contact Microdot \u2014 ' + loc.city,
      'og:url': origin + '/contact/',
      'og:description': 'Contact Microdot in ' + loc.city + ', ' + loc.state_province + '. Start your light-speed web project today via email, phone, or WhatsApp.'
    })
  },
  {
    file: 'case-studies.html',
    titleTemplate: (loc) => 'Case Studies in ' + loc.city + ' | Microdot ' + loc.country_code,
    canonical: () => DOMAIN + '/case-studies/',
    meta: (loc, cc, provinceSlug, citySlug, origin) => ({
      'description': 'Microdot case studies in ' + loc.city + ', ' + loc.state_province + '. See real-world results from pure HTML, microdata-driven web development.',
      'subject': 'Microdot Case Studies in ' + loc.city,
      'url': origin + '/case-studies/',
      'twitter:title': 'Case Studies in ' + loc.city + ' | Microdot',
      'og:title': 'Case Studies in ' + loc.city + ' | Microdot',
      'og:url': origin + '/case-studies/',
    })
  },
  {
    file: 'why-us.html',
    titleTemplate: (loc) => 'Why Microdot in ' + loc.city + ' | ' + loc.country_code + ' Web Development',
    canonical: () => DOMAIN + '/why-us/',
    meta: (loc, cc, provinceSlug, citySlug, origin) => ({
      'description': 'Why Microdot in ' + loc.city + ', ' + loc.state_province + '. Zero-bloat HTML, native microdata, and light-speed performance for local businesses.',
      'subject': 'Why Microdot in ' + loc.city,
      'url': origin + '/why-us/',
      'twitter:title': 'Why Microdot in ' + loc.city + ' | ' + loc.country_code + ' Web Development',
      'og:title': 'Why Microdot in ' + loc.city + ' | ' + loc.country_code + ' Web Development',
      'og:url': origin + '/why-us/',
    })
  }
];

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function renderTemplate(tmplConfig, html, loc, cc) {
  let result = html;

  const origin = DOMAIN;
  const provinceSlug = slugify(loc.state_province);
  const citySlug = slugify(loc.city);
  const canonical = tmplConfig.canonical(loc, cc, provinceSlug, citySlug);
  const title = tmplConfig.titleTemplate(loc);
  const metaContent = tmplConfig.meta(loc, cc, provinceSlug, citySlug, origin);

  // Replace all {{variable}} placeholders in text and attributes
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

  // Update title
  result = result.replace(
    /<title>[^<]*<\/title>/,
    '<title>' + title + '</title>'
  );

  // Update canonical
  result = result.replace(
    /<link rel="canonical" href="[^"]*"/,
    '<link rel="canonical" href="' + canonical + '"'
  );

  // Update meta name/property content attributes
  for (const [metaName, metaContentValue] of Object.entries(metaContent)) {
    const escapedName = metaName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRe = new RegExp('(<meta\\s+name="' + escapedName + '"\\s+content=")[^"]*"', 'gi');
    const propRe = new RegExp('(<meta\\s+property="' + escapedName + '"\\s+content=")[^"]*"', 'gi');
    result = result.replace(nameRe, '$1' + metaContentValue + '"');
    result = result.replace(propRe, '$1' + metaContentValue + '"');
  }

  // Update inline schema URLs
  result = result.replace(
    /(<link\s+itemprop="url"\s+href=")[^"]*(")/,
    '$1' + canonical + '$2'
  );

  // Update schema areaServed name
  const areaNameRe = /(<div\s+itemprop="areaServed"[^>]*>[\s\S]*?<meta\s+itemprop="name"\s+content=")[^"]*(")/;
  result = result.replace(areaNameRe, '$1' + loc.city + '$2');

  const containRe = /(<meta\s+itemprop="containedInPlace"\s+content=")[^"]*(")/;
  result = result.replace(containRe, '$1' + loc.state_province + '$2');

  return result;
}

// Process all geo files
const files = fs.readdirSync(GEO_DIR).filter(f => f.endsWith('.json'));
let total = 0;

for (const file of files) {
  const cc = path.basename(file, '.json').toLowerCase();
  const data = JSON.parse(fs.readFileSync(path.join(GEO_DIR, file), 'utf-8'));

  for (const loc of data) {
    const provinceSlug = slugify(loc.state_province);
    const citySlug = slugify(loc.city);
    const dirPath = path.join(OUTPUT_DIR, cc, provinceSlug);
    fs.mkdirSync(dirPath, { recursive: true });

    for (const tmplConfig of TEMPLATES) {
      const html = fs.readFileSync(path.join(__dirname, tmplConfig.file), 'utf-8');
      const rendered = renderTemplate(tmplConfig, html, loc, cc);
      const outFile = tmplConfig.file === 'index.html'
        ? path.join(dirPath, citySlug + '.html')
        : path.join(dirPath, citySlug + '-' + tmplConfig.file);
      fs.writeFileSync(outFile, rendered, 'utf-8');
    }

    total++;
    if (total % 50 === 0) process.stdout.write('.');
  }
}

console.log('\nGenerated ' + total + ' geo page sets in ' + OUTPUT_DIR);
console.log('Pages per set: ' + TEMPLATES.length + ' (' + TEMPLATES.map(t => t.file).join(', ') + ')');
