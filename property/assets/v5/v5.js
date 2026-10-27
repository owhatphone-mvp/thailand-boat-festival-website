/* Phuket Property Expo 2027 — v5: hall plan, exhibitor enquiry, 3D link tracking */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero: slow cross-fading tour of the hall (stills, GPU-smooth), skipped under reduced motion */
  var sl = document.querySelector('.hall-slides');
  if (sl && !reduce) {
    var n = +sl.getAttribute('data-n'), base = sl.getAttribute('data-base');
    var px = (window.devicePixelRatio || 1) * window.innerWidth;
    var suf = px <= 1100 ? '-1280.webp' : '.webp';
    var imgs = [], cur = -1, started = false;
    for (var k = 1; k <= n; k++) { var im = new Image(); im.alt = ''; im.decoding = 'async'; im.setAttribute('data-src', base + k + suf); sl.appendChild(im); imgs.push(im); }
    function load(i) { var im = imgs[i]; if (!im.src) im.src = im.getAttribute('data-src'); return im; }
    function show(i) {
      var im = load(i);
      var go = function () {
        if (cur >= 0) imgs[cur].classList.remove('on');
        im.classList.remove('on'); void im.offsetWidth; im.classList.add('on'); cur = i;
        if (!started) { started = true; sl.parentNode.classList.add('has-video'); }
        load((i + 1) % n);
        setTimeout(function () { show((i + 1) % n); }, 4500);
      };
      if (im.complete && im.naturalWidth) go(); else im.onload = go;
    }
    show(0);
  }

  /* Hall plan: module hotspots placed from the 3D model's booth coordinates (% of the plan image) */
  var mods = document.querySelector('.mods');
  var lay = mods && mods.getAttribute('data-layout');
  if (mods && lay) {
    lay = JSON.parse(lay);
    var kinds = JSON.parse(mods.getAttribute('data-kinds'));
    var read2 = document.querySelector('.plan-read'), lab2 = mods.getAttribute('data-mod'), size2 = mods.getAttribute('data-size'), sel2 = null;
    lay.m.forEach(function (m) {
      var b = document.createElement('button'), num = (m[0] < 10 ? '0' : '') + m[0], txt = lab2 + ' ' + num + ' · ' + size2 + ' · ' + kinds[m[3]];
      b.type = 'button'; b.textContent = num;
      b.style.left = m[1] + '%'; b.style.top = m[2] + '%';
      b.style.width = (lay.w - 0.3) + '%'; b.style.height = (lay.h - 0.8) + '%';
      b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', txt);
      b.addEventListener('click', function () { if (sel2) sel2.setAttribute('aria-pressed', 'false'); sel2 = b; b.setAttribute('aria-pressed', 'true'); read2.textContent = txt; });
      b.addEventListener('mouseenter', function () { read2.textContent = txt; });
      mods.appendChild(b);
    });
  } else if (mods) {
    var M = [[1,8.6,14.75,0],[2,14.28,14.75,0],[3,19.97,14.75,0],[4,25.66,14.75,0],[5,31.33,14.75,0],[6,37.02,14.75,0],[7,42.71,14.75,0],[8,48.39,14.75,0],[9,54.07,14.75,0],[10,59.76,14.75,0],[11,65.44,14.75,0],[12,71.13,14.75,0],[13,76.81,14.75,0],[15,82.49,14.75,0],[16,8.6,85.25,0],[17,14.28,85.25,0],[18,19.97,85.25,0],[20,25.66,85.25,0],[21,31.33,85.25,0],[22,37.02,85.25,0],[23,42.71,85.25,0],[24,48.39,85.25,0],[25,54.07,85.25,0],[26,59.76,85.25,0],[27,65.44,85.25,0],[28,71.13,85.25,0],[29,76.81,85.25,0],[30,82.49,85.25,0],[31,17.13,39.63,1],[32,22.81,39.63,1],[33,17.13,60.37,1],[34,22.81,60.37,1]];
    var W = 5.684, H = 12.44;
    var read = document.querySelector('.plan-read');
    var label = mods.getAttribute('data-mod'), size = mods.getAttribute('data-size');
    var wall = mods.getAttribute('data-wall'), open = mods.getAttribute('data-open');
    var sel = null;
    M.forEach(function (m) {
      var b = document.createElement('button');
      var num = (m[0] < 10 ? '0' : '') + m[0];
      b.type = 'button';
      b.textContent = num;
      b.style.left = m[1] + '%'; b.style.top = m[2] + '%';
      b.style.width = (W - 0.35) + '%'; b.style.height = (H - 0.9) + '%';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', label + ' ' + num + ', ' + size + ', ' + (m[3] ? open : wall));
      function pick() {
        if (sel) sel.setAttribute('aria-pressed', 'false');
        sel = b; b.setAttribute('aria-pressed', 'true');
        read.textContent = label + ' ' + num + ' · ' + size + ' · ' + (m[3] ? open : wall);
      }
      b.addEventListener('click', pick);
      b.addEventListener('mouseenter', function () { read.textContent = label + ' ' + num + ' · ' + size + ' · ' + (m[3] ? open : wall); });
      mods.appendChild(b);
    });
  }

  /* Exhibitor enquiry */
  var form = document.getElementById('enquiry');
  if (form) {
    var btn = form.querySelector('button[type=submit]');
    var msg = form.querySelector('.enq-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.lang = document.documentElement.lang;
      var text = btn.textContent; btn.disabled = true; btn.textContent = btn.getAttribute('data-sending');
      msg.className = 'enq-msg'; msg.textContent = '';
      fetch('/api/property-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () { msg.textContent = msg.getAttribute('data-ok'); form.reset(); if (window.gtag) gtag('event', 'exhibitor_enquiry', { page_section: 'property_expo', page_lang: data.lang }); })
        .catch(function () { msg.className = 'enq-msg err'; msg.textContent = msg.getAttribute('data-err'); })
        .then(function () { btn.disabled = false; btn.textContent = text; });
    });
  }

  /* 3D walkthrough links: measure interest */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="/property/3d/"]');
    if (a && window.gtag) gtag('event', 'open_3d_hall', { page_section: 'property_expo', page_lang: document.documentElement.lang });
  });
})();

/* UX pass 27 Oct 2026 — sticky dock: show it once the hero CTAs are gone, hide it over the exhibitor form */
(function () {
  var dock = document.getElementById('dock');
  if (!dock || !('IntersectionObserver' in window)) return;
  if (!window.matchMedia('(max-width:700px)').matches) return;
  dock.hidden = false;
  document.body.classList.add('has-dock');
  var hero = document.querySelector('.doors') || document.querySelector('.sheet') || document.querySelector('.arrival');
  var form = document.querySelector('#enquiry');
  var foot = document.querySelector('.foot');
  var pastHero = false, overForm = false;
  function sync() { dock.classList.toggle('on', pastHero && !overForm); }
  if (hero) new IntersectionObserver(function (es) {
    es.forEach(function (e) { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; });
    sync();
  }, { threshold: 0 }).observe(hero);
  [form, foot].forEach(function (el) {
    if (!el) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { el.dataset.dockHide = e.isIntersecting ? '1' : ''; });
      overForm = (form && form.dataset.dockHide === '1') || (foot && foot.dataset.dockHide === '1');
      sync();
    }, { threshold: 0.12 }).observe(el);
  });
})();
