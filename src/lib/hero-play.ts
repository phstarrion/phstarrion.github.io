/**
 * Home hero play layer: pointer parallax, star bursts, a pokeable mascot and a beat bob while a
 * preview plays. Everything here is decoration on top of content that already works without it,
 * and all of it stays off under prefers-reduced-motion.
 */
let dispose: (() => void) | undefined;

const BUBBLES = ['にゃ♪', 'きらっ☆', 'ぽんっ', 'るんるん♪', 'にゃにゃっ！', 'えへへ'];
const COLORS = ['#ff8fb8', '#ffd45e', '#7adcc4', '#8ec9ff', '#b9a2ff'];

interface Particle { x: number; y: number; vx: number; vy: number; life: number; ttl: number; size: number; spin: number; angle: number; color: string; shape: number; }

function drawStar(context: CanvasRenderingContext2D, radius: number) {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const r = point % 2 ? radius * .45 : radius;
    const a = (Math.PI / 5) * point - Math.PI / 2;
    context.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  context.closePath();
  context.fill();
}
function drawHeart(context: CanvasRenderingContext2D, size: number) {
  context.beginPath();
  context.moveTo(0, size * .35);
  context.bezierCurveTo(-size, -size * .35, -size * .45, -size, 0, -size * .4);
  context.bezierCurveTo(size * .45, -size, size, -size * .35, 0, size * .35);
  context.fill();
}

export function initHeroPlay(root: Document = document) {
  dispose?.();
  dispose = undefined;
  const hero = root.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const stage = hero.querySelector<HTMLElement>('[data-hero-stage]');
  const mascot = hero.querySelector<HTMLButtonElement>('[data-kotone]');
  const bubble = hero.querySelector<HTMLElement>('[data-kotone-bubble]');
  const canvas = hero.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  const context = canvas?.getContext('2d') ?? null;
  const controller = new AbortController();
  const { signal } = controller;
  const particles: Particle[] = [];
  let frame = 0;
  let pointerFrame = 0;
  let visible = true;
  let pokes = 0;

  const resize = () => {
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(hero.clientWidth * ratio);
    canvas.height = Math.round(hero.clientHeight * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const tick = () => {
    frame = 0;
    if (!context || !canvas) return;
    context.clearRect(0, 0, hero.clientWidth, hero.clientHeight);
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.life += 1;
      if (particle.life > particle.ttl) { particles.splice(index, 1); continue; }
      particle.vy += .16;
      particle.vx *= .985;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.angle += particle.spin;
      const fade = 1 - particle.life / particle.ttl;
      context.save();
      context.globalAlpha = Math.min(1, fade * 1.6);
      context.translate(particle.x, particle.y);
      context.rotate(particle.angle);
      context.fillStyle = particle.color;
      if (particle.shape === 0) drawStar(context, particle.size);
      else if (particle.shape === 1) drawHeart(context, particle.size);
      else { context.beginPath(); context.arc(0, 0, particle.size * .55, 0, Math.PI * 2); context.fill(); }
      context.restore();
    }
    if (particles.length && visible) frame = window.requestAnimationFrame(tick);
  };

  const burst = (x: number, y: number, count = 18) => {
    if (reduced.matches || !context) return;
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
        life: 0, ttl: 46 + Math.random() * 30, size: 6 + Math.random() * 9,
        spin: (Math.random() - .5) * .3, angle: Math.random() * Math.PI,
        color: COLORS[Math.floor(Math.random() * COLORS.length)], shape: Math.floor(Math.random() * 3),
      });
    }
    if (particles.length > 260) particles.splice(0, particles.length - 260);
    if (!frame) frame = window.requestAnimationFrame(tick);
  };

  hero.addEventListener('pointerdown', (event) => {
    const target = event.target as Element;
    if (target.closest('a, [data-dock-play]')) return;
    const rect = hero.getBoundingClientRect();
    burst(event.clientX - rect.left, event.clientY - rect.top, target.closest('[data-kotone]') ? 30 : 16);
  }, { signal });

  mascot?.addEventListener('click', () => {
    pokes += 1;
    if (bubble) {
      bubble.textContent = BUBBLES[(pokes - 1) % BUBBLES.length];
      bubble.classList.remove('is-pop');
      void bubble.offsetWidth;
      bubble.classList.add('is-pop');
    }
    mascot.classList.remove('is-poked');
    void mascot.offsetWidth;
    mascot.classList.add('is-poked');
  }, { signal });

  let pointerX = 0;
  let pointerY = 0;
  const applyPointer = () => {
    pointerFrame = 0;
    stage?.style.setProperty('--px', pointerX.toFixed(3));
    stage?.style.setProperty('--py', pointerY.toFixed(3));
  };
  hero.addEventListener('pointermove', (event) => {
    if (reduced.matches || !finePointer.matches || !stage) return;
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(applyPointer);
  }, { signal });
  hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; if (!pointerFrame) pointerFrame = window.requestAnimationFrame(applyPointer); }, { signal });

  // Bob to the music while the listening dock is playing.
  const dock = root.querySelector<HTMLElement>('[data-player-dock]');
  const syncBeat = () => hero.classList.toggle('is-playing', dock?.dataset.state === 'playing');
  const beatObserver = dock ? new MutationObserver(syncBeat) : undefined;
  if (dock) { beatObserver!.observe(dock, { attributes: true, attributeFilter: ['data-state'] }); syncBeat(); }

  const visibility = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    hero.classList.toggle('is-offscreen', !visible);
    if (visible && particles.length && !frame) frame = window.requestAnimationFrame(tick);
  }) : undefined;
  visibility?.observe(hero);

  window.addEventListener('resize', resize, { signal, passive: true });
  resize();
  hero.classList.add('is-ready');

  dispose = () => {
    controller.abort();
    beatObserver?.disconnect();
    visibility?.disconnect();
    if (frame) window.cancelAnimationFrame(frame);
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
  };
}
