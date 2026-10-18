import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { initMusicIndex } from '../src/lib/music-index';

let listenerSpy: MockInstance<typeof window.addEventListener>;
beforeEach(() => {
  listenerSpy = vi.spyOn(window, 'addEventListener');
});

afterEach(() => {
  for (const [type, listener] of listenerSpy.mock.calls) {
    if (type === 'hashchange') window.removeEventListener(type, listener);
  }
  document.body.innerHTML = '';
  window.history.replaceState(null, '', '/music/');
  vi.restoreAllMocks();
});

function setup(hash = '') {
  window.history.replaceState(null, '', `/music/${hash}`);
  document.body.innerHTML = '<details><summary id="track-index">曲名から探す</summary><nav><a href="#song">曲</a></nav></details><a class="track-index-return" href="#track-index">曲名一覧へ戻る</a>';
  initMusicIndex();
  return { index: document.querySelector('details')!, link: document.querySelector<HTMLAnchorElement>('.track-index-return')! };
}

describe('returning to the music index', () => {
  it('reveals the current built catalog from every track without changing link destinations or song order', () => {
    const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'dist/music/index.html'), 'utf8');
    document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)![1]
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    const index = document.querySelector<HTMLDetailsElement>('details.track-index')!;
    const choices = Array.from(index.querySelectorAll<HTMLAnchorElement>('nav a'));
    const tracks = Array.from(document.querySelectorAll<HTMLElement>('.room-track'));
    expect(tracks.length).toBeGreaterThan(0);
    expect(choices.map(link => link.hash)).toEqual(tracks.map(track => `#${track.id}`));
    expect(index.open).toBe(false);
    initMusicIndex();
    for (const track of tracks) {
      window.history.replaceState(null, '', `/music/#${track.id}`);
      index.open = false;
      const link = track.querySelector<HTMLAnchorElement>('.track-index-return')!;
      expect(link.getAttribute('href')).toBe('#track-index');
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);
      expect(index.open, track.id).toBe(true);
      expect(click.defaultPrevented).toBe(false);
    }
    expect(choices.map(link => link.hash)).toEqual(tracks.map(track => `#${track.id}`));
  });

  it('opens a collapsed index without cancelling native fragment navigation', () => {
    const { index, link } = setup('#song');
    expect(index.open).toBe(false);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(index.open).toBe(true);
    expect(click.defaultPrevented).toBe(false);
    // Returning again must still work when the hash is already the index.
    index.open = false;
    link.click();
    expect(index.open).toBe(true);
  });

  it('reveals the index on direct fragment entry and browser history navigation', () => {
    const { index } = setup('#track-index');
    expect(index.open).toBe(true);
    index.open = false;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(index.open).toBe(true);
  });

  it('keeps the index collapsed on a song link or modified return click', () => {
    const { index, link } = setup('#song');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(index.open).toBe(false);
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    expect(index.open).toBe(false);
  });
});
