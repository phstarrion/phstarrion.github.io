import { afterEach, describe, expect, it, vi } from 'vitest';
import { initSiteNavigation } from '../src/lib/site-navigation';

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

function setup(matches = false) {
  document.body.innerHTML = '<details class="site-header__menu" open><summary>メニュー</summary><nav><a href="/music/">Music</a></nav></details>';
  let onChange = () => {};
  const media = { matches, addEventListener: vi.fn((_type, callback) => { onChange = callback; }) };
  vi.spyOn(window, 'matchMedia').mockReturnValue(media as unknown as MediaQueryList);
  initSiteNavigation();
  return { menu: document.querySelector('details')!, summary: document.querySelector('summary')!, link: document.querySelector('a')!, media, change: () => onChange() };
}

describe('responsive native navigation', () => {
  it('closes on mobile and Escape returns focus to its disclosure', () => {
    const { menu, summary, link } = setup();
    expect(menu.open).toBe(false);
    menu.open = true;
    link.focus();
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });
  it('keeps desktop routes open and retains a focused route when zooming to mobile', () => {
    const { menu, link, media, change } = setup(true);
    expect(menu.open).toBe(true);
    link.focus();
    media.matches = false;
    change();
    expect(menu.open).toBe(true);
    expect(document.activeElement).toBe(link);
  });
  it('does not register duplicate listeners', () => {
    const { media } = setup();
    initSiteNavigation();
    expect(media.addEventListener).toHaveBeenCalledTimes(1);
  });
});
