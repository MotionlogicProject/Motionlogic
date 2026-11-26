/* MotionLogic · Web v2.1 — script común a todas las páginas */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ── Pantalla de carga ─────────────────────────────────────────────────────
     Solo se ve si la página tarda más de medio segundo en cargar.          */
  var top = $('.hero, .phero');
  function start() { if (top) top.classList.add('ready'); }
  var finished = false;
  function loaded() {
    if (finished) return; finished = true;
    var shown = root.classList.contains('wait-now') || performance.now() > 450;
    root.classList.remove('wait', 'wait-now');
    try { sessionStorage.removeItem('ml-nav'); } catch (e) {}
    if (shown && !reduce) { root.classList.add('ld-out'); setTimeout(function () { root.classList.remove('ld-out'); }, 480); }
    requestAnimationFrame(function () { requestAnimationFrame(start); });
  }
  if (d.readyState === 'complete') loaded();
  else { w.addEventListener('load', loaded); setTimeout(loaded, 5000); }

  /* Transición al cambiar de página */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    if (!/(\.html|\/)$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    menu(false);
    root.classList.add('leaving');
    setTimeout(function () { try { sessionStorage.setItem('ml-nav', String(Date.now())); } catch (x) {} }, 600);
    setTimeout(function () { location.href = url.href; }, reduce ? 0 : 160);
  });
  w.addEventListener('pageshow', function (e) {
    if (e.persisted) { root.classList.remove('leaving', 'wait', 'wait-now'); start(); }
  });

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ── Navegación ───────────────────────────────────────────────────────── */
  var nav = $('#nav'), prog = $('#progress'), fab = $('#fab');
  var stopFab = $$('.cta-band, #cform, footer');
  var lastY = 0;
  function onScroll() {
    var y = w.scrollY, max = root.scrollHeight - innerHeight, th = top ? top.offsetHeight - 90 : 0;
    nav.classList.toggle('solid', y > th);
    nav.classList.toggle('hide', y > lastY && y > 600 && !root.classList.contains('menu-open'));
    lastY = y;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (fab) {
      var blocked = stopFab.some(function (el) { var r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
      fab.classList.toggle('show', y > th && !blocked);
    }
  }

  var burger = $('#burger'), mmenu = $('#mmenu');
  function menu(open) {
    if (!burger) return;
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mmenu.setAttribute('aria-hidden', !open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () { menu(!root.classList.contains('menu-open')); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });

  /* ── Aparición al entrar en pantalla ──────────────────────────────────── */
  var revs = $$('[data-r], #report');
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    revs.forEach(function (el) { io.observe(el); });
  } else revs.forEach(function (el) { el.classList.add('in'); });

  /* ── Campo de nodos interactivo (cabeceras) ───────────────────────────── */
  var cv = $('#field');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), host = cv.parentNode;
    var W = 0, H = 0, fx = 0, fy = 0, tx = 0, ty = 0, pointer = false, on = true, t0 = performance.now(), GAP = 28;
    var size = function () {
      var dpr = Math.min(w.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!fx) { fx = tx = W * .3; fy = ty = H * .8; }
      draw(performance.now());
    };
    var draw = function (now) {
      ctx.clearRect(0, 0, W, H);
      if (!pointer) {
        var t = (now - t0) / 1000;
        tx = W * (.32 + .16 * Math.sin(t * .23)); ty = H * (.72 + .14 * Math.cos(t * .31));
      }
      fx += (tx - fx) * .08; fy += (ty - fy) * .08;
      var R = Math.max(W, H) * .42, R2 = R * R;
      for (var y = GAP / 2; y < H; y += GAP) {
        for (var x = GAP / 2; x < W; x += GAP) {
          var dx = x - fx, dy = y - fy, dd = dx * dx + dy * dy, k = dd < R2 ? 1 - Math.sqrt(dd) / R : 0;
          k = k * k;
          ctx.fillStyle = k > .02 ? 'rgb(' + (20 + 22 * k | 0) + ',' + (48 + 59 * k | 0) + ',' + (106 + 113 * k | 0) + ')' : '#14306A';
          ctx.beginPath(); ctx.arc(x, y, 1.4 + k * 2.6, 0, 6.2832); ctx.fill();
        }
      }
    };
    size(); w.addEventListener('resize', size);
    if (!reduce) {
      (function loop(now) { if (on) draw(now); requestAnimationFrame(loop); })(performance.now());
      var frame = $('#frame');
      host.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = cv.getBoundingClientRect(); pointer = true; tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (frame) {
          var m = frame.getBoundingClientRect();
          frame.style.setProperty('--ry', ((e.clientX - (m.left + m.width / 2)) / innerWidth * 8).toFixed(2) + 'deg');
          frame.style.setProperty('--rx', (-(e.clientY - (m.top + m.height / 2)) / innerHeight * 6).toFixed(2) + 'deg');
        }
      });
      host.addEventListener('pointerleave', function () {
        pointer = false; t0 = performance.now();
        if (frame) { frame.style.setProperty('--ry', '0deg'); frame.style.setProperty('--rx', '0deg'); }
      });
      if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { on = es[0].isIntersecting; }).observe(host);
    }
  }

  /* ── Manifiesto: las palabras se encienden al hacer scroll ────────────── */
  var big = $('#big'), words = [];
  if (big) (function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) frag.appendChild(d.createTextNode(p));
          else { var s = d.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); words.push(s); }
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) split(n);
    });
  })(big);
  function lightWords() {
    if (!big) return;
    var r = big.getBoundingClientRect();
    var n = Math.round(clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35), 0, 1) * words.length);
    words.forEach(function (s, i) { s.classList.toggle('lit', i < n); });
  }

  /* ── Servicios: imagen fija que cambia según el servicio en pantalla ─── */
  var items = $$('.svc-item'), stickImgs = $$('#svcStick img'), dots = $$('.svc-dots i'), cap = $('#svcCap'), cur = 0;
  function pickSvc() {
    if (!items.length || !cap) return;
    var mid = innerHeight / 2, best = 0, bd = 1e9;
    items.forEach(function (it, k) { var r = it.getBoundingClientRect(), dd = Math.abs(r.top + r.height / 2 - mid); if (dd < bd) { bd = dd; best = k; } });
    if (best === cur) return; cur = best;
    items.forEach(function (it, k) { it.classList.toggle('on', k === best); });
    stickImgs.forEach(function (im, k) { im.classList.toggle('on', k === best); });
    dots.forEach(function (dt, k) { dt.classList.toggle('on', k === best); });
    cap.textContent = '0' + (best + 1) + ' · ' + items[best].dataset.name;
  }

  /* ── Banda del dron: parallax ─────────────────────────────────────────── */
  var drone = $('.drone'), dImg = $('#droneImg');
  function parallax() {
    if (!drone || reduce) return;
    var r = drone.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    dImg.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) / innerHeight * -12).toFixed(2) + '%,0)';
  }

  /* ── Método: la línea se dibuja y el nodo naranja avanza ──────────────── */
  var stepsEl = $('#steps'), mLine = $('#mLine'), mProg = $('#mProg'), mHead = $('#mHead');
  var steps = $$('.step'), mNodes = $$('.m-node'), mLen = mProg && mProg.getTotalLength ? mProg.getTotalLength() : 0;
  function method() {
    if (!stepsEl) return;
    var r = stepsEl.getBoundingClientRect();
    var p = reduce ? 1 : clamp((innerHeight * .88 - r.top) / (innerHeight * .5), 0, 1);
    stepsEl.style.setProperty('--p', p);
    if (mProg) mProg.style.strokeDashoffset = 1 - p;
    if (mLen) { var pt = mProg.getPointAtLength(p * mLen); mHead.style.left = (pt.x / 10) + '%'; mHead.style.top = (pt.y / 1.2) + '%'; }
    var linear = mLine && getComputedStyle(mLine).display !== 'none';
    steps.forEach(function (s, i) {
      s.classList.toggle('on', linear ? p * 1000 >= 40 + i * 200 : s.getBoundingClientRect().top < innerHeight * .72);
    });
    mNodes.forEach(function (n, i) { n.classList.toggle('on', p * 1000 >= 96 + i * 200); });
  }

  /* Bucle de scroll */
  var ticking = false;
  function frameTick() { ticking = false; onScroll(); lightWords(); pickSvc(); parallax(); method(); }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frameTick); } }, { passive: true });
  w.addEventListener('resize', frameTick);
  frameTick();

  /* ── Carrusel de sectores ─────────────────────────────────────────────── */
  var track = $('#track'), prev = $('#scPrev'), next = $('#scNext');
  if (track && prev && next) {
    var stepW = function () { var c = $('.sector', track); return c ? c.getBoundingClientRect().width + 22 : 300; };
    var arrows = function () {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    prev.addEventListener('click', function () { track.scrollBy({ left: -stepW(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: stepW(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', arrows, { passive: true }); arrows();
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    w.addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('drag'); }
      track.scrollLeft = sl - dx;
    });
    w.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) { track.classList.remove('drag'); var s = stepW(); track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' }); }
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  }

  /* ── Pestañas de tarifas ──────────────────────────────────────────────── */
  var tabs = $$('.tab'), pill = $('#pill');
  function movePill() {
    if (!pill) return;
    var on = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
    if (on) { pill.style.width = on.offsetWidth + 'px'; pill.style.transform = 'translateX(' + on.offsetLeft + 'px)'; }
  }
  function showTab(key, focus) {
    if (!$('#t-' + key)) return false;
    tabs.forEach(function (t) {
      var on = t.id === 't-' + key;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    $$('.panel').forEach(function (p) {
      var on = p.id === 'p-' + key; p.hidden = !on; p.classList.remove('show');
      if (on) { void p.offsetWidth; p.classList.add('show'); }
    });
    movePill();
    return true;
  }
  if (tabs.length) {
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { showTab(t.id.slice(2)); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t), n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); showTab(tabs[n].id.slice(2), true); }
      });
    });
    $$('[data-tab]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (showTab(a.dataset.tab)) { e.preventDefault(); $('#tabs').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
      });
    });
    w.addEventListener('resize', movePill);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(movePill);
    movePill();
    var h = location.hash.slice(1);
    if (h === 'automatizacion') h = 'auto';
    if (showTab(h)) setTimeout(function () { $('#tabs').scrollIntoView({ block: 'start' }); }, 60);
  }

  /* ── Preguntas frecuentes ─────────────────────────────────────────────── */
  $$('.qa button').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open); b.parentNode.classList.toggle('open', open);
    });
  });

  /* ── Formulario ───────────────────────────────────────────────────────── */
  var form = $('#cform');
  if (form) {
    var q = new URLSearchParams(location.search);
    var box = q.get('interes') && $('#chips input[data-k="' + q.get('interes') + '"]');
    if (box) box.checked = true;
    var plan = q.get('plan'), picked = $('#picked');
    if (plan) { $('#planField').value = plan; picked.hidden = false; $('b', picked).textContent = plan; }
    var send = $('#send'), err = $('#err');
    form.addEventListener('submit', function (e) {
      if (!w.fetch || !w.FormData) return;
      e.preventDefault();
      send.disabled = true; err.style.display = 'none';
      var label = send.firstChild.textContent; send.firstChild.textContent = 'Enviando… ';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw 0; form.classList.add('sent'); form.reset(); })
        .catch(function () { err.style.display = 'block'; })
        .then(function () { send.disabled = false; send.firstChild.textContent = label; });
    });
  }
})();
