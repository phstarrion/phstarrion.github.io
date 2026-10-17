import { afterEach, describe, expect, it, vi } from 'vitest';
import { initMusicIndex } from '../src/lib/music-index';

afterEach(() => {
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
