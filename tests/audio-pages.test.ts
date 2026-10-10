import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const parse = async (path: string) => new DOMParser().parseFromString((await readFile(join(root, 'dist', path), 'utf8')).replace(/<link\b[^>]*>/gi, ''), 'text/html');
describe('30-second preview pages', () => {
  it('packages only preview files and exposes user-initiated controls', async () => {
    const files = await readdir(join(root, 'dist'), { recursive: true });
    expect(files.filter((path) => path.endsWith('.mp3')).sort()).toEqual(['audio/aini-ikuyo-preview.mp3', 'audio/bitcoin-ga-ippai-preview.mp3', 'audio/futaribun-8bit-mix-preview.mp3', 'audio/hodoke-preview.mp3', 'audio/hoshi-ga-terasu-mahou-monogatari-preview.mp3', 'audio/maou-wo-taoshini-preview.mp3', 'audio/ogyogi-warukute-preview.mp3', 'audio/silent-ledger-remastered-preview.mp3', 'audio/ushiro-minaide-preview.mp3']);
    expect(files.filter((path) => path.endsWith('.wav'))).toEqual([]);
    const page = await parse('index.html');
    expect(page.querySelectorAll('.listening-card')).toHaveLength(2);
    expect(page.querySelectorAll('.listening audio')).toHaveLength(2);
    expect(page.querySelectorAll('a[href$=".mp3"]')).toHaveLength(0);
    for (const audio of page.querySelectorAll('audio')) {
      expect(audio.hasAttribute('autoplay')).toBe(false);
      expect(audio.getAttribute('preload')).toBe('none');
      expect(audio.getAttribute('controlslist')).toBe('nodownload');
    }
    expect(page.querySelectorAll('.listening .track-player__suno')).toHaveLength(2);
  });
  it.each(['bitcoin-ga-ippai', 'hodoke'])('keeps a full-track Suno fallback for %s', async (slug) => {
    const page = await parse(`works/${slug}/index.html`);
    expect(page.querySelector('.track-player__suno')?.getAttribute('href')).toMatch(/^https:\/\/suno.com\/song\//);
    expect(page.querySelector('audio source')?.getAttribute('src')).toBe(`/audio/${slug}-preview.mp3`);
  });
});

it('lists every available preview with honest date labels', async () => {
  const page = await parse('music/index.html');
  expect([...page.querySelectorAll('[data-preview-available="true"]')].map((el) => el.getAttribute('data-track-id'))).toEqual(['maou-wo-taoshini', 'silent-ledger-remastered', 'aini-ikuyo', 'ushiro-minaide', 'ogyogi-warukute', 'futaribun-8bit-mix', 'hodoke', 'bitcoin-ga-ippai', 'hoshi-ga-terasu-mahou-monogatari']);
  expect(page.querySelectorAll('audio')).toHaveLength(9);
  expect(page.querySelector('#hoshi-ga-terasu-mahou-monogatari time')).toBeNull();
  expect(page.querySelector('#ogyogi-warukute .track-player__suno')?.getAttribute('href')).toContain('d51a5992');
});

it('unifies legacy music pages and uses named alternate previews without broken audio', async()=> {
  for (const slug of ['hodoke','bitcoin-ga-ippai','silent-ledger','futaribun-no-save-point','sugar-crash-protocol']) {
    const page=await parse(`works/${slug}/index.html`);
    expect(page.body.classList.contains('theme-night')).toBe(true);
    if(slug==='sugar-crash-protocol') {
      expect(page.querySelector('[data-preview-state="pending"]')?.textContent).toContain('音源は準備中');
      expect(page.querySelector('audio')).toBeNull();
    } else expect(page.querySelector('audio source')).not.toBeNull();
  }
  const silent=await parse('works/silent-ledger/index.html');
  expect(silent.querySelector('.music-preview__edition')?.textContent).toContain('Remastered');
  expect(silent.querySelector('audio source')?.getAttribute('src')).toBe('/audio/silent-ledger-remastered-preview.mp3');
  const catalog=await parse('music/index.html');
  expect(catalog.querySelector('[data-track-id="sugar-crash-protocol"]')?.textContent).toContain('音源は準備中');
});
