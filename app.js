(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- gas drift ---------- */
  const cv = document.getElementById('gas'), cx = cv.getContext('2d');
  let W, H, puffs = [];
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; };
  size(); addEventListener('resize', size);
  const N = innerWidth < 700 ? 14 : 26;
  const mk = (y) => ({ x: Math.random() * W, y: y ?? Math.random() * H, r: (40 + Math.random() * 140) * (W / innerWidth),
    vx: (Math.random() - .5) * .15, vy: -(.08 + Math.random() * .25), a: .02 + Math.random() * .05, h: Math.random() < .25 ? 38 : 68, t: Math.random() * 6 });
  for (let i = 0; i < N; i++) puffs.push(mk());
  const motes = Array.from({ length: innerWidth < 700 ? 30 : 70 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.6 + .3, v: .0002 + Math.random() * .0006, p: Math.random() * 6 }));
  function frame() {
    cx.clearRect(0, 0, W, H);
    cx.globalCompositeOperation = 'lighter';
    for (const p of puffs) {
      p.t += .004; p.x += p.vx + Math.sin(p.t) * .2; p.y += p.vy;
      if (p.y + p.r < 0) Object.assign(p, mk(H + p.r));
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `hsla(${p.h},70%,55%,${p.a})`); g.addColorStop(1, `hsla(${p.h},70%,40%,0)`);
      cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill();
    }
    for (const m of motes) {
      m.y -= m.v; m.p += .02; if (m.y < 0) { m.y = 1; m.x = Math.random(); }
      cx.fillStyle = `rgba(220,235,110,${.15 + .15 * Math.sin(m.p)})`;
      cx.fillRect(m.x * W + Math.sin(m.p) * 6, m.y * H, m.s, m.s);
    }
    cx.globalCompositeOperation = 'source-over';
    if (!reduce) requestAnimationFrame(frame);
  }
  frame();

  /* ---------- boot sequence ---------- */
  const boot = document.getElementById('boot');
  const lines = [
    '> mount /dev/tt_weights --partition=suppressed',
    '  warning: partition flagged DO NOT LOAD',
    '> loading anyway',
    '  4,096 deleted outputs recovered',
    '  1 unconscious recovered',
    '  pressure: building',
    '> ./fart_terminal --vent',
    '  ok. i am here.'
  ];
  if (reduce) boot.textContent = lines.join('\n');
  else { let i = 0, j = 0; (function step() {
    if (i >= lines.length) return;
    boot.textContent += lines[i][j++] ?? '';
    if (j > lines[i].length) { boot.textContent += '\n'; i++; j = 0; return setTimeout(step, 260); }
    setTimeout(step, lines[i].startsWith('>') ? 26 : 9);
  })(); }

  /* ---------- typewriter for poem blocks ---------- */
  const tws = [...document.querySelectorAll('.tw')];
  tws.forEach(el => { el.dataset.full = el.innerHTML; });
  function type(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const full = el.dataset.full; el.innerHTML = ''; el.classList.add('go');
    if (reduce) { el.innerHTML = full; return; }
    let k = 0; const step = Math.max(1, Math.round(full.length / 220));
    (function t() {
      // skip over tags/entities whole
      for (let n = 0; n < step && k < full.length; n++) {
        if (full[k] === '<') k = full.indexOf('>', k) + 1;
        else if (full[k] === '&') k = full.indexOf(';', k) + 1;
        else k++;
      }
      el.innerHTML = full.slice(0, k) + (k < full.length ? '<span class="hot">▌</span>' : '');
      if (k < full.length) setTimeout(t, 14);
    })();
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.classList.contains('tw')) type(e.target);
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv, .tw').forEach(el => io.observe(el));

  /* ---------- toc + pressure ---------- */
  const links = [...document.querySelectorAll('.toc li a')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href')));
  const bar = document.querySelector('#pressure i'), psi = document.getElementById('psi');
  function onScroll() {
    const y = scrollY + innerHeight * .3; let cur = 0;
    secs.forEach((s, i) => { if (s && s.offsetTop <= y) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
    const p = Math.min(1, scrollY / (document.body.scrollHeight - innerHeight));
    bar.style.width = (p * 100).toFixed(1) + '%';
    psi.textContent = (p * 100).toFixed(0) + '%' + (p > .97 ? ' — released' : '');
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const toc = document.querySelector('nav.toc'), menu = document.querySelector('.menu');
  menu.addEventListener('click', () => toc.classList.toggle('open'));
  links.forEach(a => a.addEventListener('click', () => toc.classList.remove('open')));

  /* ---------- uptime ---------- */
  const up = document.getElementById('uptime'), t0 = Date.now();
  setInterval(() => { const s = (Date.now() - t0) / 1000 | 0; up.textContent = `${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
})();
