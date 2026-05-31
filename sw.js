var CLASS_NAMES = [
  'layout', 'header', 'leftSide', 'body', 'rightSide', 'footer',
  'logo', 'visually-hidden', 'lang-switcher', 'menu-toggle', 'nav-list',
  'has-submenu', 'submenu-trigger', 'submenu', 'hero-content',
  'hero-title', 'hero-subtitle', 'hero-asset-holder', 'hero-asset', 'hero-btn',
  'event-wrapper', 'img-sizer', 'updated-badge', 'lets-talk',
  'open', 'active', 'scrolled', 'hidden'
];

var mappingStore = {};

function randomClass() {
  var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var alnum = letters + '0123456789';
  var r = '_' + letters.charAt(Math.floor(Math.random() * letters.length));
  for (var i = 1; i < 8; i++)
    r += alnum.charAt(Math.floor(Math.random() * alnum.length));
  return r;
}

function generateMapping() {
  var map = {};
  var used = new Set();
  CLASS_NAMES.forEach(function (cls) {
    var name;
    do { name = randomClass(); } while (used.has(name));
    used.add(name);
    map[cls] = name;
  });
  var id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  mappingStore[id] = map;
  setTimeout(function () { delete mappingStore[id]; }, 30000);
  return { id: id, map: map };
}

function replaceHtmlClasses(text, classMap) {
  return text.replace(/class="([^"]*)"/g, function (m, cls) {
    var nc = cls.trim().split(/\s+/).map(function (c) { return classMap[c] || c; }).join(' ');
    return 'class="' + nc + '"';
  });
}

function replaceCssClasses(text, classMap) {
  return text.replace(/\.([\w-]+)/g, function (m, cls) {
    return '.' + (classMap[cls] || cls);
  });
}

async function handleHTML(request) {
  var res = await fetch(request.url + '?__sw_bypass=1');
  var html = await res.text();

  var mapping = generateMapping();
  var map = mapping.map;
  var mapId = mapping.id;

  html = html.replace(
    /(<link[^>]*rel="stylesheet"[^>]*href=")([^"]*)("[^>]*>)/gi,
    function (m, before, href, after) {
      return before + href + '?map=' + mapId + after;
    }
  );

  var script = '<script>window.__CLASS_MAP__=' + JSON.stringify(map) + '<\/script>';
  html = html.replace('</head>', script + '</head>');
  html = replaceHtmlClasses(html, map);

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

async function handleCSS(request) {
  var url = new URL(request.url);
  var mapId = url.searchParams.get('map');
  var map = mappingStore[mapId];

  if (!map) {
    return fetch(request.url.replace(/\?map=[^&]*/, '') + '?__sw_bypass=1');
  }

  var res = await fetch(request.url.replace(/\?map=[^&]*/, '') + '?__sw_bypass=1');
  var css = await res.text();
  css = replaceCssClasses(css, map);

  return new Response(css, { headers: { 'Content-Type': 'text/css' } });
}

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (url.searchParams.has('__sw_bypass')) return;

  // Page routes: /services/ → services.html, /contact/ → contact.html
  var pageMatch = url.pathname.match(/^\/([a-z0-9_-]+)\/$/);
  if (pageMatch) {
    event.respondWith(handleHTML(new Request(pageMatch[1] + '.html')));
    return;
  }

  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.endsWith('/index.html')
  ) {
    event.respondWith(handleHTML(event.request));
  } else if (/\.css$/i.test(url.pathname)) {
    event.respondWith(handleCSS(event.request));
  } else if (!/\.[a-z0-9]+$/i.test(url.pathname)) {
    // SPA route (no file extension) — serve index.html with class map
    event.respondWith(handleHTML(event.request));
  }
});
