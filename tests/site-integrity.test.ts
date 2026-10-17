import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';

const root = resolve('dist');
const files = readdirSync(root, { recursive: true }).filter((p): p is string => typeof p === 'string' && p.endsWith('.html'));
const window = new Window({ settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true, disableJavaScriptEvaluation: true } });
const withoutExternalScripts = (html: string) => html.replace(/<script\b[^>]*\bsrc=[^>]*>[\s\S]*?<\/script>/gi, '');
const parse = (file: string) => new window.DOMParser().parseFromString(withoutExternalScripts(readFileSync(file, 'utf8')), 'text/html');

describe('complete site integrity', () => {
  it.each(files)('%s has valid internal navigation, assets and document structure', file => {
    const page = parse(join(root, file));
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(page.querySelector('main#main-content')).not.toBeNull();
    expect(page.querySelector('footer a[href="/music/"]')).not.toBeNull();
    const ids = [...page.querySelectorAll('[id]')].map(element => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const image of page.querySelectorAll('img')) {
      expect(image.hasAttribute('alt')).toBe(true);
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
    }
    for (const element of page.querySelectorAll('a[href],img[src],source[src]')) {
      const raw = element.getAttribute('href') ?? element.getAttribute('src')!;
      const url = new URL(raw, `https://site.example/${file}`);
      if (url.origin !== 'https://site.example') continue;
      let target = join(root, decodeURIComponent(url.pathname));
      if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
      expect(existsSync(target), `${file}: ${raw}`).toBe(true);
      if (url.hash && target.endsWith('.html')) {
        expect(parse(target).getElementById(decodeURIComponent(url.hash.slice(1))), `${file}: ${raw}`).not.toBeNull();
      }
    }
  });

  it('announces filter result counts and gives a recovery path for empty categories', () => {
    const browser = new Window({ url: 'https://site.example/works/', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true, disableJavaScriptEvaluation: true } });
    browser.document.write(withoutExternalScripts(readFileSync(join(root, 'works/index.html'), 'utf8')));
    browser.eval(browser.document.querySelector('script[data-work-filters]')!.textContent!);
    const status = browser.document.querySelector('[data-work-filter-status]')!;
    expect(status.getAttribute('role')).toBe('status');
    browser.document.querySelector('[data-work-filter="video"]')!.dispatchEvent(new browser.MouseEvent('click', { bubbles: true }));
    expect(status.textContent).toContain('絞り込みを解除');
    browser.document.querySelector('[data-work-filter="all"]')!.dispatchEvent(new browser.MouseEvent('click', { bubbles: true }));
    expect(status.textContent).toMatch(/\d+件の作品/);
    void browser.happyDOM.abort();
  });
});

it('every published like button has a confirmed backend catalog entry', () => {
  const allowed = new Set(JSON.parse(readFileSync('src/data/engagement-works.json', 'utf8')));
  for (const file of files) {
    const html = readFileSync(join(root, file), 'utf8');
    for (const match of html.matchAll(/data-like-work="([^"]+)"/g)) {
      expect(allowed.has(match[1]), `Backend catalog missing ${match[1]} on ${file}`).toBe(true);
    }
  }
});
