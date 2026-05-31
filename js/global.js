(function () {
  'use strict';

  // Google Analytics (gtag)
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ZY09WDB16W');

  // Cookie consent banner
  (function() {
    var CONSENT_KEY = 'microdot_consent';
    var consent = localStorage.getItem(CONSENT_KEY);
    if (consent === 'accepted') return;
    if (consent === 'declined') { gtag('consent', 'update', { 'analytics_storage': 'denied', 'ad_storage': 'denied' }); return; }
    function showBanner() {
      var banner = document.getElementById('consent-banner');
      if (!banner) return;
      setTimeout(function() { banner.classList.add('show'); }, 500);
      var accept = document.getElementById('consent-accept');
      var decline = document.getElementById('consent-decline');
      var close = document.getElementById('consent-close');
      function handleAccept() {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        banner.classList.remove('show');
      }
      function handleDecline() {
        localStorage.setItem(CONSENT_KEY, 'declined');
        gtag('consent', 'update', { 'analytics_storage': 'denied', 'ad_storage': 'denied' });
        banner.classList.remove('show');
      }
      if (accept) accept.addEventListener('click', handleAccept);
      if (decline) decline.addEventListener('click', handleDecline);
      if (close) close.addEventListener('click', handleDecline);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  })();

  // Restore visibility on bfcache navigation (back/forward)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { document.body.style.opacity = '1'; document.body.style.overflow = ''; }
  });

  window.addEventListener('offline', () =>
    console.log('The network connection has been lost.')
  );
  window.addEventListener('online', () =>
    console.log('You are now connected to the network.')
  );

  function getBrowserName(userAgent) {
    if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
    if (userAgent.includes('SamsungBrowser')) return 'Samsung Internet';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    if (userAgent.includes('Edge')) return 'Microsoft Edge (Legacy)';
    if (userAgent.includes('Edg')) return 'Microsoft Edge (Chromium)';
    if (userAgent.includes('Chrome')) return 'Google Chrome or Chromium';
    if (userAgent.includes('Safari')) return 'Apple Safari';
    return 'unknown';
  }
  console.log('You are using: ' + getBrowserName(navigator.userAgent));

  // ───────── CSS Class Randomization ─────────

  function randomClass(length) {
    if (length === void 0) length = 8;
    var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var alnum = letters + '0123456789';
    var result = '_' + letters.charAt(Math.floor(Math.random() * letters.length));
    for (var i = 1; i < length; i++)
      result += alnum.charAt(Math.floor(Math.random() * alnum.length));
    return result;
  }

  var ORIGINAL_CLASSES = [
    'layout', 'header', 'leftSide', 'body', 'rightSide', 'footer',
    'logo', 'visually-hidden', 'lang-switcher', 'menu-toggle', 'nav-list',
    'has-submenu', 'submenu-trigger', 'submenu', 'hero-content',
    'hero-title', 'hero-subtitle', 'hero-asset-holder', 'hero-asset', 'hero-btn',
    'event-wrapper', 'img-sizer', 'updated-badge', 'lets-talk',
    'open', 'active', 'scrolled', 'hidden'
  ];

  var classMap = window.__CLASS_MAP__ || (function () {
    var usedNames = new Set();
    var map = {};
    ORIGINAL_CLASSES.forEach(function (cls) {
      var name;
      do { name = randomClass(); } while (usedNames.has(name));
      usedNames.add(name);
      map[cls] = name;
    });
    return map;
  })();

  function c(original) { return classMap[original] || original; }

  function qs(originalSelector) {
    return originalSelector.replace(/\.([\w-]+)/g, function (m, cls) {
      return '.' + c(cls);
    });
  }

  // ───────── Fallback: no SW — just show the page immediately ─────────

  var initPromise = Promise.resolve();

  if (!window.__CLASS_MAP__) {
    initPromise = Promise.resolve().then(function () {
      document.body.style.opacity = '1';
    });
  }

  initPromise.then(function () {
    var sharedToday = new Date();
    var sharedDateModified = sharedToday.toISOString().split('T')[0];
    var sharedDatePublished = new Date(sharedToday.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fix domain for local dev (replaces https://microdot.solutions with current origin)
    replaceDomainInAttrs();

    // ───── Interactive code (adapted with random classes) ─────

    var lastScrollY = window.scrollY;
    var leftSide = document.querySelector(qs('.leftSide'));
    var menuToggle = document.querySelector(qs('.menu-toggle'));
    var navList = document.querySelector(qs('.nav-list'));

    window.addEventListener('scroll', function () {
      var currentScrollY = window.scrollY;
      if (window.innerWidth >= 867) {
        var navigation = document.querySelector('section#navigation');
        if (leftSide) leftSide.classList.toggle(c('scrolled'), currentScrollY > 100);
        if (navigation) navigation.classList.toggle(c('scrolled'), currentScrollY > 100);
      } else {
        if (leftSide) leftSide.classList.remove(c('scrolled'));
        if (menuToggle) menuToggle.classList.toggle(c('scrolled'), currentScrollY > 60);
      }
      lastScrollY = currentScrollY;
    }, { passive: true });

    document.querySelector(qs('.menu-toggle')).addEventListener('click', function () {
      var isOpen = navList.classList.toggle(c('open'));
      menuToggle.classList.remove(c('hidden'));
      if (isOpen) {
        menuToggle.classList.add(c('scrolled'));
      } else {
        menuToggle.classList.toggle(c('scrolled'), window.scrollY > 60);
      }
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    function setSubmenuStagger(hasSubmenu, opening) {
      var items = hasSubmenu.querySelectorAll(qs('.submenu > li'));
      var last = items.length - 1;
      items.forEach(function (li, i) {
        li.style.setProperty('--i', opening ? i : last - i);
      });
    }

    document.querySelector(qs('.submenu-trigger')).addEventListener('click', function (e) {
      e.preventDefault();
      var parent = e.target.closest(qs('.has-submenu'));
      var opening = !parent.classList.contains(c('active'));
      setSubmenuStagger(parent, opening);
      parent.classList.toggle(c('active'));
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest(qs('.has-submenu'))) {
        document.querySelectorAll(qs('.has-submenu.active')).forEach(function (el) {
          setSubmenuStagger(el, false);
          el.classList.remove(c('active'));
        });
      }
    });

    var langSwitcher = document.getElementById('lang-switcher');
    if (langSwitcher) {
      langSwitcher.addEventListener('change', function () {
        document.documentElement.lang = langSwitcher.value;
      });
    }

    // Close mobile nav on anchor click
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (navList) navList.classList.remove(c('open'));
        if (menuToggle) menuToggle.classList.remove(c('hidden'));
        document.body.style.overflow = '';
      });
    });

    // ───── Performance Router: location-based content injection ─────

    function slugify(text) {
      return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
    }

    function replaceNodeText(node, loc) {
      var walker = document.createTreeWalker(node, 4, null, false);
      var textNode;
      while (textNode = walker.nextNode()) {
        if (textNode.parentNode && (textNode.parentNode.tagName === 'SCRIPT' || textNode.parentNode.tagName === 'STYLE')) continue;
        if (textNode.textContent.indexOf('{{') === -1) continue;
        textNode.textContent = textNode.textContent
          .replace(/\{\{city\}\}/g, loc.city)
          .replace(/\{\{state_province\}\}/g, loc.state_province)
          .replace(/\{\{country\}\}/g, loc.country)
          .replace(/\{\{country_code\}\}/g, loc.country_code)
          .replace(/\{\{street_address\}\}/g, loc.street_address || '')
          .replace(/\{\{postal_code\}\}/g, loc.postal_code || '')
          .replace(/\{\{email\}\}/g, loc.email || '')
          .replace(/\{\{phone\}\}/g, loc.phone || '')
          .replace(/\{\{contactHeading\}\}/g, loc.contactHeading || '')
          .replace(/\{\{letsTalk\}\}/g, loc.letsTalk || '')
          .replace(/\{\{streetAddressLabel\}\}/g, loc.streetAddressLabel || '')
          .replace(/\{\{addressLocalityLabel\}\}/g, loc.addressLocalityLabel || '')
          .replace(/\{\{addressRegionLabel\}\}/g, loc.addressRegionLabel || '')
          .replace(/\{\{postalCodeLabel\}\}/g, loc.postalCodeLabel || '')
          .replace(/\{\{consultationTitle\}\}/g, loc.consultationTitle || '')
          .replace(/\{\{consultationLead\}\}/g, loc.consultationLead || '')
          .replace(/\{\{consultationInstruction\}\}/g, loc.consultationInstruction || '')
          .replace(/\{\{whatsappHeading\}\}/g, loc.whatsappHeading || '')
          .replace(/\{\{whatsappText\}\}/g, loc.whatsappText || '')
          .replace(/\{\{whatsappBtn\}\}/g, loc.whatsappBtn || '')
          .replace(/\{\{datePublished\}\}/g, sharedDatePublished)
          .replace(/\{\{dateModified\}\}/g, sharedDateModified)
          .replace(/\{\{updatedBadge\}\}/g, 'Updated ' + sharedDateModified)
      }
    }

    function replaceDomainInAttrs() {
      var origin = window.location.origin;
      document.querySelectorAll('[href*="microdot.solutions"], [content*="microdot.solutions"]').forEach(function(el) {
        ['href', 'content'].forEach(function(attr) {
          var val = el.getAttribute(attr);
          if (val) el.setAttribute(attr, val.replace(/https:\/\/microdot\.dev/g, origin));
        });
      });
    }

    function replaceMetaContent(loc) {
      var origin = window.location.origin;
      var map = {
        'description': loc.city + ', ' + loc.state_province,
        'keywords': loc.city + ', ' + loc.state_province + ', ' + loc.country,
        'subject': 'Web Development Services in ' + loc.city,
        'url': origin + '/' + loc.country_code.toLowerCase() + '/' + slugify(loc.state_province) + '/' + slugify(loc.city) + '/',
        'twitter:title': 'Light-Speed HTML/CSS Websites in ' + loc.city + ' | Microdot',
        'twitter:description': 'Zero framework bloat. 100% PageSpeed scores in ' + loc.city + ', ' + loc.state_province + '.',
        'og:title': 'Light-Speed HTML/CSS Websites in ' + loc.city + ' | Microdot',
        'og:url': origin + '/' + loc.country_code.toLowerCase() + '/' + slugify(loc.state_province) + '/' + slugify(loc.city) + '/',
        'og:description': 'Built with zero framework bloat. Pure HTML, lightweight CSS, and native microdata schemas engineered for 100% PageSpeed scores in ' + loc.city + ', ' + loc.state_province + '.'
      };
      for (var key in map) {
        var el = document.querySelector('meta[name="' + key + '"], meta[property="' + key + '"]');
        if (el) el.setAttribute('content', map[key]);
      }
    }

    function injectLocation(loc) {
      // Title
      document.title = 'Max Performance Web Development in ' + loc.city + ' | Microdot';

      // Canonical
      var canon = document.querySelector('link[rel="canonical"]');
      if (canon) {
        canon.setAttribute('href',
          window.location.origin + '/' + loc.country_code.toLowerCase() + '/' + slugify(loc.state_province) + '/' + slugify(loc.city) + '/'
        );
      }

      // JSON-LD for Googlebot (dynamic, so actual values are seen)
      var ldEl = document.getElementById('geo-ld');
      if (!ldEl) {
        ldEl = document.createElement('script');
        ldEl.id = 'geo-ld';
        ldEl.type = 'application/ld+json';
        document.head.appendChild(ldEl);
      }
      ldEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Microdot',
        'url': window.location.origin + '/' + loc.country_code.toLowerCase() + '/' + slugify(loc.state_province) + '/' + slugify(loc.city) + '/',
        'description': 'Max performance web development in ' + loc.city + ', ' + loc.country,
        'areaServed': {
          '@type': 'City',
          'name': loc.city,
          'containedInPlace': {
            '@type': 'State',
            'name': loc.state_province
          }
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
          'priceRange': '€€'
        }
      });

      // Microdata attributes
      var hl = document.querySelector('[itemprop="headline"]');
      if (hl) hl.innerText = 'Max Performance Web Development in ' + loc.city;

      var ac = document.querySelector('[itemprop="addressCountry"]');
      if (ac) ac.setAttribute('content', loc.country_code);

      var cip = document.querySelector('[itemprop="containedInPlace"]');
      if (cip) cip.setAttribute('content', loc.state_province);

      var an = document.querySelector('[itemprop="areaServed"] [itemprop="name"]');
      if (an) an.setAttribute('content', loc.city);

      // Dynamic dates
      var dp = document.querySelector('[itemprop="datePublished"]');
      if (dp) dp.setAttribute('content', sharedDatePublished);
      var dm = document.querySelector('[itemprop="dateModified"]');
      if (dm) dm.setAttribute('content', sharedDateModified);

      // Replace {{placeholders}} in all content/href attributes
      document.querySelectorAll('[content*="{{"], [href*="{{"]').forEach(function(el) {
        ['content', 'href'].forEach(function(attr) {
          var val = el.getAttribute(attr);
          if (val) {
            el.setAttribute(attr, val
              .replace(/\{\{city\}\}/g, loc.city)
              .replace(/\{\{state_province\}\}/g, loc.state_province)
              .replace(/\{\{country\}\}/g, loc.country)
              .replace(/\{\{country_code\}\}/g, loc.country_code)
              .replace(/\{\{street_address\}\}/g, loc.street_address || '')
              .replace(/\{\{postal_code\}\}/g, loc.postal_code || '')
              .replace(/\{\{email\}\}/g, loc.email || '')
              .replace(/\{\{phone\}\}/g, loc.phone || '')
              .replace(/\{\{contactHeading\}\}/g, loc.contactHeading || '')
              .replace(/\{\{letsTalk\}\}/g, loc.letsTalk || '')
              .replace(/\{\{streetAddressLabel\}\}/g, loc.streetAddressLabel || '')
              .replace(/\{\{addressLocalityLabel\}\}/g, loc.addressLocalityLabel || '')
              .replace(/\{\{addressRegionLabel\}\}/g, loc.addressRegionLabel || '')
              .replace(/\{\{postalCodeLabel\}\}/g, loc.postalCodeLabel || '')
              .replace(/\{\{consultationTitle\}\}/g, loc.consultationTitle || '')
              .replace(/\{\{consultationLead\}\}/g, loc.consultationLead || '')
              .replace(/\{\{consultationInstruction\}\}/g, loc.consultationInstruction || '')
              .replace(/\{\{whatsappHeading\}\}/g, loc.whatsappHeading || '')
              .replace(/\{\{whatsappText\}\}/g, loc.whatsappText || '')
              .replace(/\{\{whatsappBtn\}\}/g, loc.whatsappBtn || '')
              .replace(/\{\{datePublished\}\}/g, sharedDatePublished)
              .replace(/\{\{dateModified\}\}/g, sharedDateModified)
              .replace(/\{\{updatedBadge\}\}/g, 'Updated ' + sharedDateModified)
            );
          }
        });
      });

      // All meta tags with {{...}} placeholders
      replaceMetaContent(loc);

      // Walk all text nodes and replace {{placeholders}}
      replaceNodeText(document.body, loc);

      // Show the page after all replacements
      document.body.style.opacity = '1';

      // Updated badge — always show with current date
      var badge = document.querySelector('.' + c('updated-badge'));
      if (badge) {
        badge.textContent = 'Updated ' + sharedDateModified;
      }
    }

    function replacePagePlaceholders(loc) {
      var titleEl = document.querySelector('title');
      if (titleEl) {
        titleEl.textContent = titleEl.textContent
          .replace(/\{\{city\}\}/g, loc.city)
          .replace(/\{\{state_province\}\}/g, loc.state_province)
          .replace(/\{\{country\}\}/g, loc.country)
          .replace(/\{\{country_code\}\}/g, loc.country_code);
      }
      document.querySelectorAll('[content*="{{"], [href*="{{"]').forEach(function(el) {
        ['content', 'href'].forEach(function(attr) {
          var val = el.getAttribute(attr);
          if (val) {
            el.setAttribute(attr, val
              .replace(/\{\{city\}\}/g, loc.city)
              .replace(/\{\{state_province\}\}/g, loc.state_province)
              .replace(/\{\{country\}\}/g, loc.country)
              .replace(/\{\{country_code\}\}/g, loc.country_code)
              .replace(/\{\{street_address\}\}/g, loc.street_address || '')
              .replace(/\{\{postal_code\}\}/g, loc.postal_code || '')
              .replace(/\{\{email\}\}/g, loc.email || '')
              .replace(/\{\{phone\}\}/g, loc.phone || '')
              .replace(/\{\{contactHeading\}\}/g, loc.contactHeading || '')
              .replace(/\{\{letsTalk\}\}/g, loc.letsTalk || '')
              .replace(/\{\{streetAddressLabel\}\}/g, loc.streetAddressLabel || '')
              .replace(/\{\{addressLocalityLabel\}\}/g, loc.addressLocalityLabel || '')
              .replace(/\{\{addressRegionLabel\}\}/g, loc.addressRegionLabel || '')
              .replace(/\{\{postalCodeLabel\}\}/g, loc.postalCodeLabel || '')
              .replace(/\{\{consultationTitle\}\}/g, loc.consultationTitle || '')
              .replace(/\{\{consultationLead\}\}/g, loc.consultationLead || '')
              .replace(/\{\{consultationInstruction\}\}/g, loc.consultationInstruction || '')
              .replace(/\{\{whatsappHeading\}\}/g, loc.whatsappHeading || '')
              .replace(/\{\{whatsappText\}\}/g, loc.whatsappText || '')
               .replace(/\{\{whatsappBtn\}\}/g, loc.whatsappBtn || '')
               .replace(/\{\{datePublished\}\}/g, sharedDatePublished)
               .replace(/\{\{dateModified\}\}/g, sharedDateModified)
               .replace(/\{\{updatedBadge\}\}/g, 'Updated ' + sharedDateModified)
            );
          }
        });
      });
      replaceNodeText(document.body, loc);
      document.body.style.opacity = '1';
    }

    function isCountryCode(str) {
      return /^[a-z]{2}$/i.test(str);
    }

    function resolveDefaultLocation() {
      var lang = navigator.language || navigator.userLanguage || '';
      var guess = lang.split('-')[1] || lang.split('-')[0] || '';
      var cc = guess.toLowerCase();
      var fallback = ['ae','al','am','ao','ar','at','au','az','ba','bd','be','bg','bh','bo','br','by','ca','ch','ci','cl','co','cr','cy','cz','de','dk','do','dz','ec','ee','eg','es','et','fi','fr','gb','ge','gh','gr','gt','hk','hn','hr','hu','id','ie','il','is','it','jp','ke','kh','kr','kw','kz','la','lk','lt','lu','lv','ma','md','me','mk','mm','mn','mt','mx','my','mz','ng','ni','nl','no','np','nz','om','pa','pe','ph','pk','pl','pr','pt','py','qa','ro','rs','sa','se','sg','si','sk','sn','sv','th','tn','tr','tw','tz','ua','ug','us','uy','vn','xk','za'];
      if (fallback.indexOf(cc) === -1) cc = 'de';
      fetch('/geo-data/' + cc + '.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { if (data && data.length) injectLocation(data[0]); else document.body.style.opacity = '1'; })
        .catch(function () { document.body.style.opacity = '1'; });
    }

    var pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && isCountryCode(pathParts[0])) {
      var urlCountry = pathParts[0];
      var urlProvince = pathParts[1];
      var urlCity = pathParts[2] || '';

      fetch('/geo-data/' + urlCountry.toLowerCase() + '.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.length) {
            var match;
            if (urlCity) {
              match = data.find(function (item) {
                return slugify(item.state_province) === urlProvince && slugify(item.city) === urlCity;
              });
            } else {
              match = data.find(function (item) {
                return slugify(item.state_province) === urlProvince || slugify(item.city) === urlProvince;
              });
            }
            injectLocation(match || data[0]);
          } else {
            document.body.style.opacity = '1';
          }
        })
        .catch(function () { document.body.style.opacity = '1'; });
    } else if (pathParts.length === 0) {
      resolveDefaultLocation();
    } else {
      var lang = navigator.language || navigator.userLanguage || '';
      var guess = lang.split('-')[1] || lang.split('-')[0] || '';
      var cc = guess.toLowerCase();
      var fallback = ['ae','al','am','ao','ar','at','au','az','ba','bd','be','bg','bh','bo','br','by','ca','ch','ci','cl','co','cr','cy','cz','de','dk','do','dz','ec','ee','eg','es','et','fi','fr','gb','ge','gh','gr','gt','hk','hn','hr','hu','id','ie','il','is','it','jp','ke','kh','kr','kw','kz','la','lk','lt','lu','lv','ma','md','me','mk','mm','mn','mt','mx','my','mz','ng','ni','nl','no','np','nz','om','pa','pe','ph','pk','pl','pr','pt','py','qa','ro','rs','sa','se','sg','si','sk','sn','sv','th','tn','tr','tw','tz','ua','ug','us','uy','vn','xk','za'];
      if (fallback.indexOf(cc) === -1) cc = 'de';
      fetch('/geo-data/' + cc + '.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.length) {
            replacePagePlaceholders(data[0]);
          } else {
            document.body.style.opacity = '1';
          }
        })
        .catch(function () { document.body.style.opacity = '1'; });
    }
  });
})();
