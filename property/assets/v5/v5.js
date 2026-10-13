/* Phuket Property Expo 2027 — v5: model turntable, hall plan, exhibitor enquiry */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Turntable: frames rendered from the hall's 3D model; drag or arrow keys to turn */
  var tt = document.querySelector('.turntable');
  if (tt) {
    var img = tt.querySelector('img');
    var n = +tt.getAttribute('data-frames') || 24;
    var cur = +tt.getAttribute('data-start') || 12;
    var dir = (window.innerWidth >= 700 || window.devicePixelRatio > 1.5) ? 'turn' : 'turn-s';
    var base = '/property/assets/v5/' + dir + '/f';
    var frames = [], loaded = 0, ready = false;
    function src(i) { return base + (i < 10 ? '0' : '') + i + '.webp'; }
    function show(i) {
      i = Math.max(0, Math.min(n - 1, Math.round(i)));
      if (i === cur && img.getAttribute('data-f') == i) return;
      cur = i; img.setAttribute('data-f', i);
      if (frames[i] && frames[i].complete) { img.removeAttribute('srcset'); img.src = frames[i].src; }
    }
    function preload() {
      for (var i = 0; i < n; i++) {
        var im = new Image();
        im.decoding = 'async';
        im.onload = im.onerror = function () { if (++loaded === n) { ready = true; intro(); } };
        im.src = src(i); frames[i] = im;
      }
    }
    // the one authored moment: once every frame is in, the model settles a quarter turn into place
    function intro() {
      if (reduce || tt.getAttribute('data-touched')) return;
      var from = 4, to = +tt.getAttribute('data-start') || 12, t0 = null, dur = 1600;
      function step(t) {
        if (tt.getAttribute('data-touched')) return;
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * k);
        show(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step);
      }
      show(from); requestAnimationFrame(step);
    }
    if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 1500 }); else setTimeout(preload, 400);

    var drag = null;
    tt.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, f: cur, locked: e.pointerType === 'mouse' };
      tt.setAttribute('data-touched', '1');
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.locked) {               // touch: only take horizontal drags, leave vertical scrolling alone
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        drag.locked = true;
      }
      tt.classList.add('dragging');
      if (ready) show(drag.f - dx / (tt.clientWidth / 30));
    });
    function end() { drag = null; tt.classList.remove('dragging'); }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    tt.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); tt.setAttribute('data-touched', '1');
      if (ready) show(cur + (e.key === 'ArrowLeft' ? 1 : -1));
    });
  }

  /* Hall plan: module hotspots placed from the 3D model's booth coordinates (% of the plan image) */
  var mods = document.querySelector('.mods');
  if (mods) {
    var M = [[1,8.39,14.75,0],[2,13.94,14.75,0],[3,19.49,14.75,0],[4,25.04,14.75,0],[5,30.58,14.75,0],[6,36.13,14.75,0],[7,41.68,14.75,0],[8,47.23,14.75,0],[9,52.77,14.75,0],[10,58.32,14.75,0],[11,63.87,14.75,0],[12,69.42,14.75,0],[13,74.96,14.75,0],[15,80.51,14.75,0],[16,8.39,85.25,0],[17,13.94,85.25,0],[18,19.49,85.25,0],[20,25.04,85.25,0],[21,30.58,85.25,0],[22,36.13,85.25,0],[23,41.68,85.25,0],[24,47.23,85.25,0],[25,52.77,85.25,0],[26,58.32,85.25,0],[27,63.87,85.25,0],[28,69.42,85.25,0],[29,74.96,85.25,0],[30,80.51,85.25,0],[31,16.72,39.63,1],[32,22.26,39.63,1],[33,16.72,60.37,1],[34,22.26,60.37,1]];
    var W = 5.547, H = 12.44;
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
