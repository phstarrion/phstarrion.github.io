/**
 * Site-wide scroll reveal for elements marked `data-reveal`. Progressive enhancement only:
 * content is visible without JavaScript, with reduced motion, inside the first viewport,
 * and as soon as it receives keyboard focus.
 */
let observer: IntersectionObserver | undefined;

export function initReveal(root: Document = document) {
  observer?.disconnect();
  observer = undefined;
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!targets.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const show = (element: HTMLElement) => {
    element.classList.remove('reveal-pending');
    observer?.unobserve(element);
  };
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) show(entry.target as HTMLElement); });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight || element.contains(root.activeElement)) return;
    const siblings = Array.from(element.parentElement?.children ?? []).filter((node) => node.hasAttribute('data-reveal'));
    element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element), 5) * 70}ms`);
    element.classList.add('reveal-pending');
    element.addEventListener('focusin', () => show(element), { once: true });
    observer!.observe(element);
  });
}
