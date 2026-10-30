/* Antoine Hinary — site behaviour.
   SHOW_EMPTY_SLOTS: true shows the dashed boxes for media you haven't uploaded yet.
   Set it to false once you're done, so visitors never see an empty slot. */
const SHOW_EMPTY_SLOTS = true;

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile menu ---- */
  const nav = document.querySelector('.nav');
  const btn = document.querySelector('.menu-btn');
  if (nav && btn) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* ---- Media slots: a slot becomes a real video/image as soon as the file exists ---- */
  if (!SHOW_EMPTY_SLOTS) document.documentElement.classList.add('slots-hidden');
  document.querySelectorAll('.slot[data-video], .slot[data-img]').forEach((slot) => {
    const cap = slot.dataset.caption || '';
    const replace = (el) => {
      const fig = document.createElement('figure');
      fig.className = slot.className.replace(/\bslot\b/, '').trim();
      fig.appendChild(el);
      if (cap) { const fc = document.createElement('figcaption'); fc.textContent = cap; fig.appendChild(fc); }
      slot.replaceWith(fig);
    };
    if (slot.dataset.video) {
      const v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.controls = true; v.loop = true; v.preload = 'auto';
      v.addEventListener('loadedmetadata', () => {
        replace(v);
        new IntersectionObserver((entries) => entries.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
        }), { threshold: 0.4 }).observe(v);
      }, { once: true });
      v.src = slot.dataset.video + '#t=0.1';
    } else {
      const im = new Image();
      im.alt = slot.dataset.alt || cap; im.loading = 'lazy';
      im.onload = () => replace(im);
      im.src = slot.dataset.img;
    }
  });

  /* ---- Project filters ---- */
  const chips = document.querySelectorAll('.chip[data-filter]');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    document.querySelectorAll('.project[data-tags]').forEach((p) => {
      p.hidden = !(f === 'all' || p.dataset.tags.split(' ').includes(f));
    });
    document.querySelectorAll('.group').forEach((g) => {
      g.hidden = !g.querySelector('.project:not([hidden])');
    });
  }));

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---- Hero: rotating keypoint point-cloud (6D pose estimation motif) ---- */
  const hc = document.getElementById('hero-canvas');
  if (hc) {
    const ctx = hc.getContext('2d');
    const N = 1500, pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      const x = Math.cos(th) * r, z = Math.sin(th) * r;
      const n = 1 + 0.09 * Math.sin(5 * x + 3 * y) * Math.cos(4 * z + 1.3);
      pts.push([x * n, y * n, z * n]);
    }
    const KP = 14, kp = [];
    for (let k = 0; k < KP; k++) kp.push(Math.floor(((k + 0.5) / KP) * N * 0.94 + 37 * k) % N);
    let W = 0, H = 0, dpr = 1, mx = 0, my = 0, rot = 0.6;
    const fpsEl = document.querySelector('[data-fps]'), frameEl = document.querySelector('[data-frame]');
    let frame = 0, last = performance.now(), acc = 0, cnt = 0;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hc.clientWidth; H = hc.clientHeight;
      hc.width = W * dpr; hc.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size(); window.addEventListener('resize', size);
    window.addEventListener('pointermove', (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; });
    const proj = new Array(N);
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      const wide = W > 820;
      const cx = wide ? W * 0.68 : W * 0.5, cy = wide ? H * 0.46 : H * 0.2;
      const R = wide ? Math.min(W * 0.27, H * 0.36) : Math.min(W * 0.36, H * 0.15);
      const ay = rot + mx * 0.8, ax = 0.35 + my * 0.5;
      const ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax);
      const scan = Math.sin(t * 0.0007) * 1.05;
      for (let i = 0; i < N; i++) {
        let [x, y, z] = pts[i];
        let X = x * ca + z * sa, Z = -x * sa + z * ca;
        let Y = y * cb - Z * sb; Z = y * sb + Z * cb;
        const p = 2.8 / (2.8 + Z);
        const px = cx + X * R * p, py = cy + Y * R * p;
        proj[i] = [px, py, Z];
        const depth = (1 - Z) / 2;
        const near = Math.abs(y - scan) < 0.035;
        ctx.fillStyle = near ? 'rgba(127,227,255,' + (0.5 + depth * 0.5) + ')' : 'rgba(225,232,238,' + (0.08 + depth * 0.5) + ')';
        const s = near ? 1.9 : 0.6 + depth * 1.1;
        ctx.fillRect(px - s / 2, py - s / 2, s, s);
      }
      ctx.strokeStyle = 'rgba(127,227,255,.38)'; ctx.lineWidth = 1;
      ctx.beginPath();
      kp.forEach((idx, k) => { const [px, py] = proj[idx]; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
      ctx.closePath(); ctx.stroke();
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      kp.forEach((idx, k) => {
        const [px, py, z] = proj[idx];
        const a = z < 0.2 ? 1 : 0.35;
        ctx.strokeStyle = 'rgba(127,227,255,' + a + ')';
        ctx.strokeRect(px - 4, py - 4, 8, 8);
        if (z < 0.2) { ctx.fillStyle = 'rgba(127,227,255,.85)'; ctx.fillText('kp_' + String(k + 1).padStart(2, '0'), px + 8, py - 6); }
      });
      // pose axes at center
      const ax3 = [[1, 0, 0], [0, -1, 0], [0, 0, 1]].map(([x, y, z]) => {
        let X = x * ca + z * sa, Z = -x * sa + z * ca; let Y = y * cb - Z * sb;
        return [cx + X * R * 0.32, cy + Y * R * 0.32];
      });
      const cols = ['rgba(255,110,110,.8)', 'rgba(120,230,150,.8)', 'rgba(127,227,255,.9)'];
      ax3.forEach(([x, y], i) => { ctx.strokeStyle = cols[i]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); });
    };
    if (reduce) { draw(0); }
    else {
      const loop = (t) => {
        rot += 0.0022; draw(t); frame++;
        const dt = t - last; last = t; acc += dt; cnt++;
        if (acc > 500) {
          if (fpsEl) fpsEl.textContent = Math.round((1000 * cnt) / acc);
          if (frameEl) frameEl.textContent = String(frame).padStart(6, '0');
          acc = 0; cnt = 0;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  /* ---- Neurovia: electrode grid with multiplexed channel scan ---- */
  const ec = document.getElementById('ecog');
  if (ec) {
    const ctx = ec.getContext('2d');
    const draw = (t) => {
      const w = ec.clientWidth, h = ec.clientHeight, d = Math.min(window.devicePixelRatio || 1, 2);
      if (ec.width !== w * d) { ec.width = w * d; ec.height = h * d; }
      ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, w, h);
      const cols = 8, rows = 6, padX = w * 0.12, padY = h * 0.16, gx = (w - padX * 2) / (cols - 1), gy = (h * 0.72 - padY) / (rows - 1);
      const active = Math.floor(t / 420) % (cols * rows);
      // substrate
      ctx.strokeStyle = 'rgba(236,242,247,.16)'; ctx.lineWidth = 1;
      ctx.strokeRect(padX - gx * 0.5, padY - gy * 0.5, gx * cols, gy * rows);
      const mux = [w * 0.5, h * 0.9];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c, x = padX + c * gx, y = padY + r * gy;
        const on = i === active || i === (active + 17) % (cols * rows);
        if (on) {
          ctx.strokeStyle = 'rgba(127,227,255,.55)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(mux[0], mux[1]); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(x, y, on ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = on ? 'rgba(127,227,255,1)' : 'rgba(236,242,247,.22)'; ctx.fill();
      }
      ctx.fillStyle = 'rgba(236,242,247,.9)'; ctx.fillRect(mux[0] - 34, mux[1] - 9, 68, 18);
      ctx.fillStyle = '#050607'; ctx.font = '600 10px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText('MUX', mux[0], mux[1] + 3.5);
      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(127,227,255,.9)';
      ctx.fillText('CH ' + String(active + 1).padStart(2, '0') + ' · CH ' + String(((active + 17) % 48) + 1).padStart(2, '0'), 14, 20);
    };
    if (reduce) draw(0); else { const l = (t) => { draw(t); requestAnimationFrame(l); }; requestAnimationFrame(l); }
    window.addEventListener('resize', () => draw(performance.now()));
  }
})();
