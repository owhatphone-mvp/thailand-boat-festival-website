/* Phuket Property Expo 2027 — v5: walk-in arrival, hall plan, exhibitor enquiry */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Arrival: frames rendered at eye level from the hall's 3D model. On load the camera glides in from the
     entrance (the one authored moment); scrolling past the hero carries it on towards the lounge. */
  var img = document.querySelector('.walk-frame');
  if (img) {
    var n = +img.getAttribute('data-frames') || 20, settle = +img.getAttribute('data-settle') || 8;
    var portrait = window.matchMedia && window.matchMedia('(max-aspect-ratio: 9/10)').matches;
    var base = '/property/assets/v5/' + (portrait ? 'walk-m' : 'walk') + '/w';
    var hero = document.querySelector('.arrival');
    var frames = [], loaded = 0, ready = false, cur = 0, glide = 0;
    function src(i) { return base + (i < 10 ? '0' : '') + i + '.webp'; }
    function show(i) {
      i = Math.max(0, Math.min(n - 1, Math.round(i)));
      if (i === cur || !frames[i] || !frames[i].complete) return;
      cur = i;
      var s = img.parentNode.querySelector('source');
      if (s) s.parentNode.removeChild(s);
      img.src = frames[i].src;
    }
    function scrolled() {
      var r = hero.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.8)));  // 0 at top .. 1 as the hero leaves
      return settle + p * (n - 1 - settle);
    }
    function onScroll() { if (ready && glide >= 1) show(scrolled()); }
    function start() {
      if (reduce) { show(settle); return; }
      var t0 = null, dur = 2600;
      function step(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        glide = k;
        var e = 1 - Math.pow(2, -9 * k);
        show(Math.max(e * settle, k >= 1 ? scrolled() : 0));
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function preload() {
      for (var i = 0; i < n; i++) {
        var im = new Image();
        im.decoding = 'async';
        im.onload = im.onerror = function () { if (++loaded === n) { ready = true; start(); } };
        im.src = src(i); frames[i] = im;
      }
    }
    if (document.readyState === 'complete') preload(); else window.addEventListener('load', preload);
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; onScroll(); });
    }, { passive: true });
  }

  /* Hall plan: module hotspots placed from the 3D model's booth coordinates (% of the plan image) */
  var mods = document.querySelector('.mods');
  if (mods) {
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
