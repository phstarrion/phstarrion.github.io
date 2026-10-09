/** Progressive enhancement: every work remains visible without JavaScript. */
export function initHomeMotion() {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero || !('IntersectionObserver' in window)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 768px)');
  const targets = Array.from(document.querySelectorAll<HTMLElement>(
    '.home-content .section-heading, .featured-song__cover, .featured-song__copy, ' +
    '.music-grid > li, .selected-works .work-grid > li, .play .game-spotlight, .atelier-about',
  ));
  let observer: IntersectionObserver | undefined;
  let frame = 0;
  let heroVisible = true;

  const reveal = (element: HTMLElement) => {
    element.classList.remove('motion-pending');
    observer?.unobserve(element);
  };

  const updateParallax = () => {
    frame = 0;
    if (reducedMotion.matches || !desktop.matches || !heroVisible) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
    hero.style.setProperty('--art-shift', `${Math.min(rect.height * .024, 18) * progress}px`);
    hero.style.setProperty('--light-shift', `${-28 * progress}px`);
  };
  const requestParallax = () => {
    if (!frame && heroVisible && desktop.matches && !reducedMotion.matches) {
      frame = window.requestAnimationFrame(updateParallax);
    }
  };

  const configure = () => {
    observer?.disconnect();
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    hero.style.removeProperty('--art-shift');
    hero.style.removeProperty('--light-shift');
    targets.forEach((element) => element.classList.remove('motion-pending'));
    if (reducedMotion.matches) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement);
      });
    }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });

    targets.forEach((element) => {
      // Leave the current viewport, restored scroll positions and focused links visible.
      if (element.getBoundingClientRect().top < window.innerHeight || element.contains(document.activeElement)) return;
      const siblings = element.parentElement?.children;
      const isCard = element.matches('.music-grid > li, .work-grid > li');
      const order = siblings && isCard ? Array.from(siblings).indexOf(element) : 0;
      element.style.setProperty('--reveal-delay', `${Math.min(order, 2) * 90}ms`);
      element.classList.add('motion-pending');
      observer!.observe(element);
    });
    requestParallax();
  };

  targets.forEach((element) => element.addEventListener('focusin', () => reveal(element)));
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (heroVisible) requestParallax();
  });
  heroObserver.observe(hero);
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax, { passive: true });
  window.addEventListener('pageshow', configure);
  reducedMotion.addEventListener('change', configure);
  desktop.addEventListener('change', configure);
  configure();
}
