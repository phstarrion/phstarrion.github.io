import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const parse = async (path: string) => new DOMParser().parseFromString((await readFile(join(root, 'dist', path), 'utf8')).replace(/<link\b[^>]*>/gi, ''), 'text/html');
describe('30-second preview pages', () => {
  it('packages only the two preview files and exposes user-initiated controls', async () => {
    const files = await readdir(join(root, 'dist'), { recursive: true });
    expect(files.filter((path) => path.endsWith('.mp3')).sort()).toEqual(['audio/bitcoin-ga-ippai-preview.mp3', 'audio/hodoke-preview.mp3']);
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
