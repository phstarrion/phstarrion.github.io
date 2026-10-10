import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));

const representativePages = [
  ['Home', 'index.html'],
  ['Music', 'music/index.html'],
  ['Games', 'games/index.html'],
  ['Works', 'works/index.html'],
  ['work detail', 'works/sugar-crash-protocol/index.html'],
  ['Journal', 'journal/index.html'],
  ['journal article', 'journal/ryuseimachi/index.html'],
  ['About', 'about/index.html'],
] as const;

describe('representative page accessibility', () => {
  it.each(representativePages)('has no axe violations on %s', async (_, path) => {
    const html = await readFile(join(testDirectory, '..', 'dist', path), 'utf8');
    const parsedPage = new DOMParser().parseFromString(
      html.replace(/<link\b[^>]*>/gi, ''),
      'text/html',
    );
    document.documentElement.lang = parsedPage.documentElement.lang;
    document.head.innerHTML = parsedPage.head.innerHTML;
    document.body.innerHTML = parsedPage.body.innerHTML;

    const results = await axe.run(document, {
      rules: {
        // happy-dom does not implement browser layout or resolved external CSS, so axe cannot
        // calculate rendered color contrast here. DESIGN.md token ratios and browser review
        // remain the source of truth for contrast; this runner covers the DOM-based rules.
        'color-contrast': { enabled: false },
        region: { enabled: true },
      },
    });

    expect(results.violations).toEqual([]);
  });
});


describe('home and listening navigation', () => {
  it('connects named song links to focusable, labelled preview destinations and back', async () => {
    const home = new DOMParser().parseFromString(await readFile(join(testDirectory, '..', 'dist/index.html'), 'utf8'), 'text/html');
    const music = new DOMParser().parseFromString(await readFile(join(testDirectory, '..', 'dist/music/index.html'), 'utf8'), 'text/html');
    expect(home.querySelector('a[href="/music/#tracks"]')?.textContent).toContain('30秒試聴');
    expect(music.getElementById('tracks')?.getAttribute('tabindex')).toBe('-1');
    for (const link of home.querySelectorAll('a[href^="/music/#"]')) {
      const id = link.getAttribute('href')!.split('#')[1];
      const destination = music.getElementById(id)!;
      expect(destination).not.toBeNull();
      expect(destination.getAttribute('tabindex')).toBe('-1');
      if (id !== 'tracks') {
        const title = music.getElementById(destination.getAttribute('aria-labelledby')!)!.textContent!;
        expect(link.getAttribute('aria-label')).toContain(title);
        expect(destination.querySelector('audio')?.getAttribute('aria-label')).toContain(title);
      }
    }
    expect(music.querySelector('a[href="/#music-title"]')?.textContent).toContain('トップページ');
    expect(home.getElementById('music-title')?.getAttribute('tabindex')).toBe('-1');
    expect(music.querySelector('audio[autoplay]')).toBeNull();
  });
});
