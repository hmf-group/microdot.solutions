(function () {
  'use strict';

  function loadAnalytics() {
    if (window._analyticsLoaded) return;
    window._analyticsLoaded = true;
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZY09WDB16W';
    document.head.appendChild(g);
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-MMCHP2');
  }

  (function() {
    var CONSENT_KEY = 'microdot_consent';
    var consent = localStorage.getItem(CONSENT_KEY);
    if (consent === 'accepted') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadAnalytics);
      } else {
        setTimeout(loadAnalytics, 2000);
      }
      return;
    }
    if (consent === 'declined') { return; }
    function showBanner() {
      var banner = document.getElementById('consent-banner');
      if (!banner) return;
      setTimeout(function() { banner.classList.add('show'); }, 500);
      var accept = document.getElementById('consent-accept');
      var decline = document.getElementById('consent-decline');
      var close = document.getElementById('consent-close');
      function handleAccept() {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        loadAnalytics();
        banner.classList.remove('show');
      }
      function handleDecline() {
        localStorage.setItem(CONSENT_KEY, 'declined');
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

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { document.body.style.opacity = '1'; document.body.style.overflow = ''; }
  });

  window.addEventListener('offline', function () {
    console.log('The network connection has been lost.');
  });
  window.addEventListener('online', function () {
    console.log('You are now connected to the network.');
  });

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

  var lastScrollY = window.scrollY;
  var menuToggle = document.querySelector('.menu-toggle');
  var navList = document.querySelector('.nav-list');

  window.addEventListener('scroll', function () {
    var currentScrollY = window.scrollY;
    if (window.innerWidth >= 867) {
      var navigation = document.querySelector('section#navigation');
      var leftSide = document.querySelector('.leftSide');
      if (leftSide) leftSide.classList.toggle('scrolled', currentScrollY > 100);
      if (navigation) navigation.classList.toggle('scrolled', currentScrollY > 100);
    } else {
      if (menuToggle) menuToggle.classList.toggle('scrolled', currentScrollY > 60);
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      var isOpen = navList.classList.toggle('open');
      menuToggle.classList.remove('hidden');
      if (isOpen) {
        menuToggle.classList.add('scrolled');
      } else {
        menuToggle.classList.toggle('scrolled', window.scrollY > 60);
      }
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  function setSubmenuStagger(hasSubmenu, opening) {
    var items = hasSubmenu.querySelectorAll('.submenu > li');
    var last = items.length - 1;
    items.forEach(function (li, i) {
      li.style.setProperty('--i', opening ? i : last - i);
    });
  }

  var submenuTrigger = document.querySelector('.submenu-trigger');
  if (submenuTrigger) {
    submenuTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      var parent = e.target.closest('.has-submenu');
      var opening = !parent.classList.contains('active');
      setSubmenuStagger(parent, opening);
      parent.classList.toggle('active');
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-submenu')) {
      document.querySelectorAll('.has-submenu.active').forEach(function (el) {
        setSubmenuStagger(el, false);
        el.classList.remove('active');
      });
    }
  });

  var langSwitcher = document.getElementById('lang-switcher');
  if (langSwitcher) {
    langSwitcher.addEventListener('change', function () {
      document.documentElement.lang = langSwitcher.value;
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (navList) navList.classList.remove('open');
      if (menuToggle) menuToggle.classList.remove('hidden');
      document.body.style.overflow = '';
    });
  });

  document.body.style.opacity = '1';
})();
