/*
 * The opening, told as a small story: darkness and one unlit lamp. The guest lights it in his memory.
 * The verse appears in the lamplight, dawn breaks, doves rise from the flame, the gate opens onto light,
 * and his portrait is there in the doorway before it settles into its place on the page.
 */
import Art from './art.js';
import Music from './music.js';

const Intro = (function () {
  const LEAF_OUTLINE = 'M0 600V200C0 92 86 22 200 0V600Z';
  const ARCH = 'M40 640V240C40 132 126 62 240 40 354 62 440 132 440 240V640Z';
  const OUTER_ARCH = 'M14 660V236C14 112 112 36 240 8 368 36 466 112 466 236V660';
  const AUTO_LIGHT_MS = 7000;

  function leafSvg(flip) {
    const panels = `
      <path d="${LEAF_OUTLINE}" fill="url(#g-door)" stroke="#a9792c" stroke-width="3"/>
      <path d="M20 582V206C20 112 94 50 184 28V582Z" fill="url(#g-door-panel)" stroke="#b98a3a" stroke-width="2"/>
      <path d="M34 568V344H170V568Z" fill="none" stroke="#c49a4e" stroke-width="1.6"/>
      <path d="M44 558V354H160V558Z" fill="none" stroke="#c49a4e" stroke-opacity=".6" stroke-width="1"/>
      <path d="M34 320V210C34 130 96 76 170 54V320Z" fill="none" stroke="#c49a4e" stroke-width="1.6"/>
      <path d="M44 310V212C44 142 100 94 160 72V310Z" fill="none" stroke="#c49a4e" stroke-opacity=".6" stroke-width="1"/>
      <g transform="translate(102 250) scale(.8)" fill="none" stroke="#b98a3a" stroke-width="1.4">
        ${[-64, -32, 0, 32, 64].map((a) => `<path d="M0 0C-9-9-11-27 0-42 11-27 9-9 0 0Z" transform="rotate(${a})"/>`).join('')}
        <path d="M-36 8C-18 16 18 16 36 8"/>
      </g>
      <g transform="translate(102 480) scale(.8)" fill="none" stroke="#b98a3a" stroke-width="1.4">
        ${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M0 0C-9-9-11-27 0-42 11-27 9-9 0 0Z" transform="rotate(${a})"/>`).join('')}
      </g>
      <circle cx="200" cy="332" r="60" fill="#fff8e6" stroke="#a9792c" stroke-width="2.4"/>
      <circle cx="200" cy="332" r="49" fill="none" stroke="#c49a4e" stroke-width="1.2"/>
      <g transform="translate(200 350)" fill="#f7e7bd" stroke="#a9792c" stroke-width="1.3">
        ${[-70, -46, -22, 0].map((a) => `<path d="M0 0C-7-10-9-28 0-42 9-28 7-10 0 0Z" transform="rotate(${a})"/>`).join('')}
      </g>
      <circle cx="176" cy="404" r="9" fill="none" stroke="#a9792c" stroke-width="3"/>
    `;
    const inner = flip ? `<g transform="translate(200 0) scale(-1 1)">${panels}</g>` : panels;
    return `<svg viewBox="0 0 200 600" preserveAspectRatio="none" aria-hidden="true">${inner}</svg>`;
  }

  function frameSvg() {
    return `<svg class="gate-frame-art" viewBox="0 0 480 680" aria-hidden="true">
      <path d="${OUTER_ARCH}" fill="none" stroke="url(#g-gold)" stroke-width="16" stroke-linejoin="round"/>
      <path d="M32 660V238C32 124 122 54 240 26 358 54 448 124 448 238V660" fill="none" stroke="#fff7e2" stroke-width="7"/>
      <path d="${ARCH}" fill="none" stroke="url(#g-gold)" stroke-width="6"/>
      <g fill="url(#g-gold)">
        <path d="M0 640H52L60 680H-8Z"/>
        <path d="M428 640H480L488 680H420Z"/>
      </g>
      <g transform="translate(240 12)" fill="#fbeec8" stroke="#a9792c" stroke-width="1.5">
        ${[-72, -48, -24, 0, 24, 48, 72].map((a) => `<path d="M0 0C-9-12-11-34 0-52 11-34 9-12 0 0Z" transform="rotate(${a})"/>`).join('')}
      </g>
    </svg>`;
  }

  /** Vines climbing both sides of the arch, with blooms opening as the vine passes them. */
  function garlandSvg(offset = 0) {
    const svgNs = 'http://www.w3.org/2000/svg';
    const probe = document.createElementNS(svgNs, 'svg');
    probe.style.cssText = 'position:absolute;width:0;height:0';
    document.body.appendChild(probe);
    const makeVine = (d) => {
      const p = document.createElementNS(svgNs, 'path');
      p.setAttribute('d', d);
      probe.appendChild(p);
      return p;
    };
    const leftD = 'M6 668C-6 590 22 510 6 430 -8 350 20 280 26 214 34 130 120 54 232 18';
    const rightD = 'M474 668C486 590 458 510 474 430 488 350 460 280 454 214 446 130 360 54 248 18';
    const vines = [leftD, rightD].map(makeVine);
    const kinds = ['lily', 'leaf', 'jasmine', 'leaf', 'bud', 'jasmine', 'leaf', 'jasmine'];
    const scales = { lily: .68, jasmine: .4, bud: .62, leaf: .46 };
    let vinesOut = '';
    let blooms = '';
    vines.forEach((path, side) => {
      const len = path.getTotalLength();
      vinesOut += `<path class="vine" d="${path.getAttribute('d')}" style="stroke-dasharray:${len};--len:${len}"/>`;
      const steps = window.innerWidth < 700 ? 22 : 30;
      for (let i = 0; i < steps; i++) {
        const t = (i + .3) / steps;
        const pt = path.getPointAtLength(len * t);
        const near = path.getPointAtLength(Math.min(len, len * t + 2));
        const heading = (Math.atan2(near.y - pt.y, near.x - pt.x) * 180) / Math.PI;
        const kind = kinds[i % kinds.length];
        const delay = offset + 1000 + t * 2700;
        const flipSide = i % 2 === 0 ? 1 : -1;
        const out = (side === 0 ? -1 : 1) * flipSide * 9;
        const x = pt.x + out;
        const y = pt.y + (i % 3) * 3 - 3;
        if (kind === 'leaf') blooms += Art.leaf(x, y, heading + flipSide * 55 + (side ? 180 : 0), scales.leaf, delay);
        else blooms += Art.flower(kind, x, y, scales[kind], delay);
      }
    });
    probe.remove();

    const base = [
      Art.flower('lily', -34, 640, 1.05, offset + 1500),
      Art.flower('jasmine', 28, 660, .55, offset + 1700),
      Art.flower('lily', 514, 640, 1.05, offset + 1600),
      Art.flower('jasmine', 452, 660, .55, offset + 1800),
      Art.flower('jasmine', -64, 676, .5, offset + 1900),
      Art.flower('jasmine', 544, 676, .5, offset + 2000),
    ].join('');
    const lotuses = Art.lotus(58, 684, 1.05, offset + 1100) + Art.lotus(422, 684, 1.05, offset + 1300);

    return `<svg class="gate-frame-art" viewBox="0 0 480 680" aria-hidden="true">${vinesOut}${blooms}${base}${lotuses}</svg>`;
  }

  /* ---------- Night sky and rising embers ---------- */
  function paintStars(canvas, seed, count) {
    const rand = Art.seeded(seed);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    for (let i = 0; i < count; i++) {
      const y = h * rand() ** 1.5;
      const r = .4 + rand() * 1.15;
      ctx.fillStyle = `rgba(255,${235 + Math.floor(rand() * 20)},${205 + Math.floor(rand() * 50)},${.35 + rand() * .65})`;
      ctx.beginPath();
      ctx.arc(w * rand(), y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function createEmbers(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    const parts = [];
    const state = { x: w / 2, y: h / 2, rate: 0, spread: 0, alive: true };
    let last = performance.now();
    let owed = 0;

    function frame(now) {
      if (!state.alive) return;
      const dt = Math.min((now - last) / 1000, .05);
      last = now;
      owed += state.rate * dt;
      while (owed >= 1 && parts.length < 130) {
        owed -= 1;
        const angle = state.spread ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - .5) * .9;
        const speed = state.spread ? 26 + Math.random() * 90 : 18 + Math.random() * 46;
        parts.push({
          x: state.x + (Math.random() - .5) * 12,
          y: state.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          phase: Math.random() * 6.3,
          life: 0,
          span: 2.4 + Math.random() * 3.4,
          r: .8 + Math.random() * 1.9,
        });
      }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life > p.span) {
          parts.splice(i, 1);
          continue;
        }
        p.phase += dt * 2;
        p.x += (p.vx + Math.sin(p.phase) * 12) * dt;
        p.y += p.vy * dt;
        const a = Math.sin((p.life / p.span) * Math.PI);
        ctx.fillStyle = `rgba(255,214,130,${a * .22})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,244,210,${a * .95})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return state;
  }

  function build(root) {
    root.innerHTML = `
      <div class="gate-overlay hold">
        <div class="sky-gradient"></div>
        <div class="gate-scene">
          <div class="sun"></div>
          <div class="rays"></div>
          <div class="gate-clouds"></div>
          <div class="gate-box">
            <svg viewBox="0 0 480 680" aria-hidden="true"><path d="${ARCH}" fill="url(#g-beyond)"/></svg>
            <div class="gate-opening">
              <div class="gate-leaf left">${leafSvg(false)}</div>
              <div class="gate-leaf right">${leafSvg(true)}</div>
            </div>
            ${frameSvg()}
          </div>
          <div class="gate-burst"></div>
          <div class="gate-glow"></div>
          <div class="gate-floor-wrap"></div>
          <div class="gate-garden">${garlandSvg(5000)}</div>
        </div>
        <div class="gate-doves"></div>
        <div class="night">
          <canvas class="stars a"></canvas>
          <canvas class="stars b"></canvas>
        </div>
        <div class="lamp-glow"></div>
        <canvas class="embers"></canvas>
        <div class="lamp-rig">${Art.lampSvg()}</div>
        <p class="lamp-hint">Touch the lamp to light it in his memory</p>
        <div class="gate-verse">
          <p class="verse-a">You may have left this world,</p>
          <p class="verse-b">but you will never leave our hearts.</p>
        </div>
        <div class="gate-text gate-om">Om Shanti</div>
        <div class="gate-text gate-caption">
          <p class="script">In Loving Memory</p>
          <p class="name">Dr Jayaraman a/l Munusamy</p>
          <p class="span">22 March 1938 – 30 October 2026</p>
        </div>
        <div class="gate-flash"></div>
        <div class="gate-portrait">
          <div class="gate-halo"></div>
          <div class="portrait-oval"><img src="assets/portrait.webp" alt=""></div>
        </div>
        <button type="button" class="gate-skip" aria-label="Skip the opening">Skip</button>
      </div>`;
    Art.bakeLights(root);
    // The night hides these clouds, so paint them just after the lamp is on screen rather than before it.
    requestAnimationFrame(() => setTimeout(() => {
      const clouds = root.querySelector('.gate-clouds');
      if (!clouds) return;
      Art.populateSky(clouds);
      Art.populateSky(root.querySelector('.gate-floor-wrap'), { floor: true });
      root.querySelectorAll('.gate-floor-wrap .cloud').forEach((c) => c.remove());
    }, 40));
    paintStars(root.querySelector('.stars.a'), 17, 150);
    paintStars(root.querySelector('.stars.b'), 43, 110);
  }

  /** Doves burst out of the lamplight, and three more return to fly in through the open doors. */
  function flyFlock(layer, lamp, door) {
    const from = { x: `${lamp.x}px`, y: `${lamp.y}px` };
    for (let i = 0; i < 8; i++) {
      const right = i % 2 === 0;
      const reach = 16 + i * 4;
      Art.flyDove(layer, {
        duration: 3300 + i * 110,
        delay: 6300 + i * 170,
        flip: !right,
        flap: `${.44 + (i % 3) * .05}s`,
        path: [
          { ...from, s: .12, at: 0, o: 0 },
          { x: `${50 + (right ? 1 : -1) * reach}vw`, y: `${52 - i * 3}vh`, s: .55 + (i % 3) * .14, at: .38, o: 1 },
          { x: `${50 + (right ? 1 : -1) * (reach + 26)}vw`, y: `${28 - i * 2}vh`, s: .7, at: .72, o: 1 },
          { x: `${right ? 118 : -18}vw`, y: `${12 + i}vh`, s: .55, at: 1, o: 1 },
        ],
      });
    }
    const into = { x: `${door.x}px`, y: `${door.y}px` };
    [
      { delay: 9300, flip: false, x0: -14, y0: 34, x1: 22, y1: 26 },
      { delay: 9800, flip: true, x0: 114, y0: 28, x1: 76, y1: 24 },
      { delay: 10300, flip: false, x0: -12, y0: 56, x1: 26, y1: 48 },
    ].forEach((d) => {
      Art.flyDove(layer, {
        duration: 2900,
        delay: d.delay,
        flip: d.flip,
        flap: '.56s',
        path: [
          { x: `${d.x0}vw`, y: `${d.y0}vh`, s: .72, at: 0, o: 1 },
          { x: `${d.x1}vw`, y: `${d.y1}vh`, s: .72, at: .55, o: 1 },
          { ...into, s: .08, at: 1, o: 0 },
        ],
      });
    });
  }

  /** Runs the scene and resolves once the page is showing. */
  function play(root, petals) {
    return new Promise((resolve) => {
      build(root);
      const q = (s) => root.querySelector(s);
      const overlay = q('.gate-overlay');
      const embers = createEmbers(q('.embers'));
      const timers = [];
      let lit = false;
      let done = false;
      let autoTimer = 0;

      const heroRect = document.querySelector('#portrait .portrait-oval').getBoundingClientRect();
      const box = q('.gate-box').getBoundingClientRect();
      const doorCenter = { x: box.left + box.width / 2, y: box.top + box.height * .56 };
      const lampHome = { x: window.innerWidth / 2, y: window.innerHeight * .62 };
      const lampThreshold = { x: doorCenter.x, y: box.bottom - box.height * .05 };

      // The portrait is laid out at its final page position, then transformed up into the doorway.
      const portrait = q('.gate-portrait');
      portrait.style.cssText = `left:${heroRect.left}px;top:${heroRect.top}px;width:${heroRect.width}px;height:${heroRect.height}px`;
      const doorScale = Math.min((box.width * .6) / heroRect.width, 1.15);
      const inDoor = `translate(${doorCenter.x - (heroRect.left + heroRect.width / 2)}px, ${doorCenter.y - (heroRect.top + heroRect.height / 2)}px) scale(${doorScale})`;

      const animate = (el, frames, delay, duration, easing = 'ease-in-out') => el.animate(frames, { delay, duration, easing, fill: 'both' });
      // Later stages on the same element must not take effect until their own moment arrives.
      const later = (el, frames, delay, duration, easing = 'ease-in-out') => el.animate(frames, { delay, duration, easing, fill: 'forwards' });
      const fadeIn = [{ opacity: 0, filter: 'blur(7px)', transform: 'translateY(8px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }];
      const fadeOut = [{ opacity: 1 }, { opacity: 0 }];
      const at = (ms, fn) => timers.push(setTimeout(fn, ms));

      embers.x = lampHome.x;
      embers.y = lampHome.y - 44;
      const rig = q('.lamp-rig');
      rig.style.left = `${lampHome.x}px`;
      rig.style.top = `${lampHome.y}px`;
      const glow = q('.lamp-glow');
      glow.style.left = `${lampHome.x}px`;
      glow.style.top = `${lampHome.y - 44}px`;

      function finish() {
        if (done) return;
        done = true;
        embers.alive = false;
        timers.forEach(clearTimeout);
        clearTimeout(autoTimer);
        root.innerHTML = '';
        document.documentElement.classList.remove('play-intro');
        resolve();
      }

      function light(byTouch) {
        if (lit) return;
        lit = true;
        clearTimeout(autoTimer);
        overlay.classList.remove('hold');
        overlay.classList.add('lit');
        // Browsers only allow sound after a touch. A lamp that lights by itself stays silent until the guest presses Play.
        if (byTouch) Music.play(4000);

        animate(q('.lamp-hint'), fadeOut, 0, 400);
        embers.rate = 16;
        animate(glow, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.35)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], 0, 2600, 'ease-out');
        animate(q('.verse-a'), fadeIn, 700, 1700);
        animate(q('.verse-b'), fadeIn, 2700, 1800);
        animate(q('.gate-verse'), fadeOut, 5300, 1000);

        // Dawn: the night lifts away from the lamp, and the camera settles back as the gate appears.
        at(5200, () => petals?.setDensity(window.innerWidth < 700 ? 16 : 30));
        animate(q('.night'), fadeOut, 5200, 3600);
        animate(q('.gate-scene'), [{ transform: 'scale(1.16)' }, { transform: 'scale(1)' }], 5200, 4200, 'cubic-bezier(.2,.6,.2,1)');
        animate(q('.gate-om'), fadeIn, 6400, 1500);
        const dx = lampThreshold.x - lampHome.x;
        const dy = lampThreshold.y - lampHome.y;
        animate(rig, [{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.42)` }], 5300, 3000, 'cubic-bezier(.45,0,.2,1)');
        later(glow, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: .35, transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.55)` }], 5300, 3000);
        at(5400, () => { embers.x = lampThreshold.x; embers.y = lampThreshold.y - 18; embers.rate = 10; });
        flyFlock(q('.gate-doves'), lampHome, doorCenter);

        // The doors open onto light, and he is there.
        at(8800, () => {
          embers.x = doorCenter.x;
          embers.y = doorCenter.y;
          embers.spread = 1;
          embers.rate = 28;
          petals?.setDensity(window.innerWidth < 700 ? 24 : 44);
        });
        animate(q('.gate-burst'), [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6) rotate(0deg)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1) rotate(14deg)' }], 9000, 4600, 'ease-out');
        animate(portrait, [
          { opacity: 0, filter: 'brightness(1.9)', transform: `${inDoor} scale(.9)` },
          { opacity: 1, filter: 'brightness(1)', transform: `${inDoor} scale(1)` },
        ], 10200, 2400, 'ease-out');
        animate(q('.gate-caption'), fadeIn, 11200, 1700);

        // Everything else dissolves into light while the portrait comes down to the page.
        at(14200, () => { embers.rate = 0; });
        later(q('.gate-caption'), fadeOut, 14300, 800);
        later(q('.gate-om'), fadeOut, 14300, 800);
        animate(q('.gate-flash'), [{ opacity: 0 }, { opacity: 1 }], 14400, 1400);
        portrait.animate(
          [{ transform: inDoor }, { transform: 'none' }],
          { delay: 15000, duration: 1700, easing: 'cubic-bezier(.45,0,.15,1)', fill: 'forwards' },
        );
        const leave = overlay.animate(fadeOut, { delay: 16700, duration: 1200, easing: 'ease-out', fill: 'both' });
        leave.finished.then(finish).catch(finish);
      }

      overlay.addEventListener('click', (e) => {
        if (e.target.closest('button') || lit) return;
        // A ring answers the touch at once, wherever it landed.
        const ring = document.createElement('div');
        ring.className = 'touch-ring';
        ring.style.left = `${e.clientX}px`;
        ring.style.top = `${e.clientY}px`;
        overlay.appendChild(ring);
        ring.addEventListener('animationend', () => ring.remove());
        light(true);
      });
      window.addEventListener('keydown', function onKey(e) {
        if (done) {
          window.removeEventListener('keydown', onKey);
          return;
        }
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest?.('button')) light(true);
      });
      autoTimer = setTimeout(() => light(false), AUTO_LIGHT_MS);

      q('.gate-skip').addEventListener('click', () => {
        timers.forEach(clearTimeout);
        clearTimeout(autoTimer);
        const quick = overlay.animate([{ opacity: getComputedStyle(overlay).opacity }, { opacity: 0 }], { duration: 450, fill: 'forwards' });
        quick.finished.then(finish).catch(finish);
      });
    });
  }

  /** The same gate, waiting at the foot of the page. Its animations stay paused until the guest arrives. */
  function endScene(root) {
    root.innerHTML = `
      <div class="end-glow"></div>
      <div class="gate-box">
        <svg viewBox="0 0 480 680" aria-hidden="true"><path d="${ARCH}" fill="url(#g-beyond)"/></svg>
        <div class="gate-opening">
          <div class="gate-leaf left">${leafSvg(false)}</div>
          <div class="gate-leaf right">${leafSvg(true)}</div>
        </div>
        ${frameSvg()}
        <div class="end-portrait">
          <div class="gate-halo"></div>
          <div class="portrait-oval"><img src="assets/portrait.webp" alt="" width="432" height="1280"></div>
        </div>
      </div>
      <div class="end-floor"></div>
      <div class="gate-box gate-garland">${garlandSvg()}</div>
      <div class="end-lamp lit">${Art.lampSvg()}</div>
      <div class="end-doves"></div>`;
    Art.bakeLights(root);
    const floor = Art.cloudCanvas(1800, 460, 83, { floor: true, puffs: 110 });
    root.querySelector('.end-floor').appendChild(floor);
  }

  return { play, endScene };
})();

export default Intro;
