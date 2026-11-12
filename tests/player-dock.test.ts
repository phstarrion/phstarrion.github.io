// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initPlayerDock, nextTrackId, resetPlayerDockForTests, type DockTrack } from '../src/lib/player-dock';

const catalog: DockTrack[] = [
  { id: 'first', title: 'First', cover: '/images/first.jpeg', sunoUrl: 'https://suno.com/song/first', url: '/works/first/' },
  { id: 'second', title: 'Second', url: '/music/#second' },
];

function mount() {
  document.documentElement.className = '';
  document.body.innerHTML = `
    <div data-track-player><button data-audio-toggle data-audio-title="First" aria-controls="audio-first"><span data-audio-action>30秒試聴</span></button>
      <audio id="audio-first" data-track-audio></audio></div>
    <ul><li data-now-playing="second"><button data-dock-play="second" data-dock-title="Second"></button></li></ul>
    <aside data-player-dock hidden>
      <audio data-dock-audio preload="none"></audio>
      <input type="range" data-dock-seek min="0" max="30" value="0" />
      <a data-dock-link href="/music/"><img data-dock-cover hidden alt="" /></a>
      <p data-dock-title></p><p data-dock-status></p><span data-dock-time></span>
      <button data-dock-prev></button><button data-dock-toggle></button><button data-dock-next></button>
      <button data-dock-continuous aria-pressed="true"></button>
      <a data-dock-suno hidden></a><button data-dock-close></button>
      <script type="application/json" data-dock-catalog>${JSON.stringify(catalog)}</script>
    </aside>`;
  const audio = document.querySelector<HTMLAudioElement>('[data-dock-audio]')!;
  audio.play = vi.fn(async () => { audio.dispatchEvent(new Event('playing')); });
  audio.pause = vi.fn(() => { audio.dispatchEvent(new Event('pause')); });
  return { dock: document.querySelector<HTMLElement>('[data-player-dock]')!, audio };
}

describe('persistent listening dock', () => {
  beforeEach(() => { resetPlayerDockForTests(); localStorage.clear(); });

  it('cycles through the catalog in both directions', () => {
    expect(nextTrackId(catalog, 'first', 1)).toBe('second');
    expect(nextTrackId(catalog, 'second', 1)).toBe('first');
    expect(nextTrackId(catalog, 'first', -1)).toBe('second');
    expect(nextTrackId(catalog, undefined, 1)).toBe('first');
    expect(nextTrackId([], 'first', 1)).toBeUndefined();
  });

  it('takes over page play buttons, opens only after a user action and keeps labels in sync', async () => {
    const { dock, audio } = mount();
    initPlayerDock();
    expect(dock.hidden).toBe(true);
    expect(audio.play).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains('dock-ready')).toBe(true);

    const pageButton = document.querySelector<HTMLButtonElement>('[data-audio-toggle]')!;
    pageButton.click();
    await Promise.resolve();
    expect(dock.hidden).toBe(false);
    expect(dock.dataset.trackId).toBe('first');
    expect(audio.getAttribute('src')).toBe('/audio/first-preview.mp3');
    expect(pageButton.dataset.playState).toBe('playing');
    expect(pageButton.getAttribute('aria-label')).toBe('Firstの試聴を一時停止する');
    expect(document.querySelector<HTMLAnchorElement>('[data-dock-suno]')!.hidden).toBe(false);

    pageButton.click();
    expect(audio.pause).toHaveBeenCalled();
    expect(pageButton.dataset.playState).toBe('paused');
  });

  it('switches tracks from jacket buttons and marks the playing item', async () => {
    const { dock } = mount();
    initPlayerDock();
    document.querySelector<HTMLButtonElement>('[data-dock-play="second"]')!.click();
    await Promise.resolve();
    expect(dock.dataset.trackId).toBe('second');
    expect(document.querySelector('[data-now-playing="second"]')!.hasAttribute('data-now-playing-active')).toBe(true);
    expect(document.querySelector<HTMLAnchorElement>('[data-dock-suno]')!.hidden).toBe(true);
  });

  it('continues to the next preview when one ends, unless the visitor turns that off', async () => {
    const { dock, audio } = mount();
    initPlayerDock();
    document.querySelector<HTMLButtonElement>('[data-audio-toggle]')!.click();
    await Promise.resolve();
    audio.dispatchEvent(new Event('ended'));
    await Promise.resolve();
    expect(dock.dataset.trackId).toBe('second');

    document.querySelector<HTMLButtonElement>('[data-dock-continuous]')!.click();
    expect(localStorage.getItem('kanon-dock-continuous-v1')).toBe('off');
    audio.dispatchEvent(new Event('ended'));
    await Promise.resolve();
    expect(dock.dataset.trackId).toBe('second');
    expect(dock.dataset.state).toBe('paused');
  });

  it('stops and hides when closed', async () => {
    const { dock, audio } = mount();
    initPlayerDock();
    document.querySelector<HTMLButtonElement>('[data-audio-toggle]')!.click();
    await Promise.resolve();
    document.querySelector<HTMLButtonElement>('[data-dock-close]')!.click();
    expect(audio.pause).toHaveBeenCalled();
    expect(dock.hidden).toBe(true);
    expect(document.documentElement.classList.contains('dock-open')).toBe(false);
  });
});
