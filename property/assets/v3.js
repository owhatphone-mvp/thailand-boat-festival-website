/* Phuket Property Expo — depth on scroll + flat-plan toggle */
(function () {
  // Flat / 3D plan toggle
  var stage = document.querySelector('.model-stage');
  var btn = document.querySelector('[data-plan-toggle]');
  if (stage && btn) {
    btn.addEventListener('click', function () {
      var flat = stage.classList.toggle('flat');
      btn.setAttribute('aria-pressed', flat ? 'true' : 'false');
      btn.textContent = flat ? btn.getAttribute('data-label-3d') : btn.getAttribute('data-label-flat');
    });
  }

  // Parallax: layers move at different speeds while the page scrolls
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var layers = [].slice.call(document.querySelectorAll('[data-depth]'));
  if (!layers.length) return;
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    for (var i = 0; i < layers.length; i++) {
      var el = layers[i];
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) continue;
      var d = parseFloat(el.getAttribute('data-depth')) || 0;
      var offset = (box.top + box.height / 2 - vh / 2) * d;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* exhibitor enquiry form */
(function () {
  var form = document.getElementById('enquiry');
  if (!form) return;
  var btn = form.querySelector('button[type=submit]');
  var msg = form.querySelector('.enq-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.lang = document.documentElement.lang;
    var label = btn.textContent; btn.disabled = true; btn.textContent = btn.getAttribute('data-sending');
    msg.className = 'enq-msg'; msg.textContent = '';
    fetch('/api/property-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function () { msg.textContent = msg.getAttribute('data-ok'); form.reset(); if (window.gtag) gtag('event', 'exhibitor_enquiry', { page_section: 'property_expo', page_lang: data.lang }); })
      .catch(function () { msg.className = 'enq-msg err'; msg.textContent = msg.getAttribute('data-err'); })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  });
})();
