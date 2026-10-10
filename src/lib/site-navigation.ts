/** Native details stays open without JavaScript, keeping every route reachable. */
export function initSiteNavigation() {
  const menu = document.querySelector<HTMLDetailsElement>('.site-header__menu');
  const summary = menu?.querySelector('summary');
  if (!menu || !summary || menu.dataset.initialized) return;
  menu.dataset.initialized = 'true';
  const desktop = window.matchMedia('(min-width: 768px)');
  const configure = () => {
    // Do not hide the focused item when resizing or zooming to the mobile layout.
    menu.open = desktop.matches || menu.contains(document.activeElement);
  };
  configure();
  desktop.addEventListener('change', configure);
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || desktop.matches || !menu.open) return;
    event.preventDefault();
    summary.focus();
    menu.open = false;
  });
}
