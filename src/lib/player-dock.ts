/**
 * Persistent listening dock. One audio element plays every 30-second preview, survives page
 * navigation (see BaseLayout's ClientRouter + transition:persist) and keeps every in-page
 * play button in sync. Without JavaScript the native <audio controls> on each page still work.
 */
export interface DockTrack {
  id: string;
  title: string;
  cover?: string;
  sunoUrl?: string;
  url: string;
}

const CONTINUOUS_KEY = 'kanon-dock-continuous-v1';
let ready = false;
let pageListeners: AbortController | undefined;

const formatTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
};

export function nextTrackId(catalog: readonly DockTrack[], currentId: string | undefined, step: 1 | -1): string | undefined {
  if (!catalog.length) return undefined;
  const index = catalog.findIndex((track) => track.id === currentId);
  if (index < 0) return catalog[0].id;
  return catalog[(index + step + catalog.length) % catalog.length].id;
}

export function initPlayerDock(root: Document = document) {
  const dock = root.querySelector<HTMLElement>('[data-player-dock]');
  const audio = dock?.querySelector<HTMLAudioElement>('[data-dock-audio]');
  if (!dock || !audio) return;

  const syncButtons = () => {
    const currentId = dock.dataset.trackId;
    const state = dock.dataset.state ?? 'idle';
    root.querySelectorAll<HTMLButtonElement>('[data-audio-toggle]').forEach((button) => {
      const id = (button.getAttribute('aria-controls') ?? '').replace(/^audio-/, '');
      const active = id === currentId;
      const loading = active && state === 'loading';
      const playing = active && state === 'playing';
      const title = button.dataset.audioTitle ?? 'この曲';
      button.dataset.playState = playing ? 'playing' : 'paused';
      button.setAttribute('aria-disabled', String(loading));
      button.setAttribute('aria-busy', String(loading));
      const action = button.querySelector<HTMLElement>('[data-audio-action]');
      if (action) action.textContent = loading ? '読み込み中…' : playing ? '一時停止' : '30秒試聴';
      button.setAttribute('aria-label', loading ? `${title}の音源を読み込み中` : playing ? `${title}の試聴を一時停止する` : `${title}を30秒試聴する`);
    });
    root.querySelectorAll<HTMLButtonElement>('[data-dock-play]').forEach((button) => {
      const active = button.dataset.dockPlay === currentId;
      const playing = active && state === 'playing';
      const title = button.dataset.dockTitle ?? 'この曲';
      button.dataset.playState = playing ? 'playing' : active && state === 'loading' ? 'loading' : 'paused';
      button.setAttribute('aria-label', playing ? `${title}の試聴を一時停止する` : `${title}を30秒試聴する`);
    });
    root.querySelectorAll<HTMLElement>('[data-now-playing]').forEach((element) => {
      element.toggleAttribute('data-now-playing-active', element.dataset.nowPlaying === currentId && state === 'playing');
    });
  };

  if (ready) { syncButtons(); return; }
  ready = true;

  const catalog: DockTrack[] = JSON.parse(dock.querySelector('[data-dock-catalog]')?.textContent ?? '[]');
  const byId = new Map(catalog.map((track) => [track.id, track]));
  const title = dock.querySelector<HTMLElement>('[data-dock-title]')!;
  const cover = dock.querySelector<HTMLImageElement>('[data-dock-cover]')!;
  const link = dock.querySelector<HTMLAnchorElement>('[data-dock-link]')!;
  const suno = dock.querySelector<HTMLAnchorElement>('[data-dock-suno]')!;
  const toggle = dock.querySelector<HTMLButtonElement>('[data-dock-toggle]')!;
  const seek = dock.querySelector<HTMLInputElement>('[data-dock-seek]')!;
  const time = dock.querySelector<HTMLElement>('[data-dock-time]')!;
  const status = dock.querySelector<HTMLElement>('[data-dock-status]')!;
  const continuous = dock.querySelector<HTMLButtonElement>('[data-dock-continuous]')!;
  let attempt = 0;
  let seeking = false;

  const readContinuous = () => { try { return localStorage.getItem(CONTINUOUS_KEY) !== 'off'; } catch { return true; } };
  const setContinuous = (on: boolean) => {
    continuous.setAttribute('aria-pressed', String(on));
    try { localStorage.setItem(CONTINUOUS_KEY, on ? 'on' : 'off'); } catch { /* page-local only */ }
  };
  setContinuous(readContinuous());

  const setState = (state: 'idle' | 'loading' | 'playing' | 'paused') => {
    dock.dataset.state = state;
    const current = byId.get(dock.dataset.trackId ?? '');
    toggle.dataset.playState = state === 'playing' ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', state === 'playing' ? `${current?.title ?? '試聴'}を一時停止する` : `${current?.title ?? '試聴'}を再生する`);
    syncButtons();
  };

  const renderTime = () => {
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 30;
    seek.max = String(duration);
    if (!seeking) seek.value = String(audio.currentTime);
    dock.style.setProperty('--dock-progress', `${Math.min(100, (audio.currentTime / duration) * 100)}%`);
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
    seek.setAttribute('aria-valuetext', `${formatTime(audio.currentTime)}、全体${formatTime(duration)}`);
  };

  const load = (track: DockTrack) => {
    dock.dataset.trackId = track.id;
    title.textContent = track.title;
    link.href = track.url;
    link.setAttribute('aria-label', `${track.title}のページを開く`);
    if (track.cover) { cover.src = track.cover; cover.hidden = false; } else { cover.hidden = true; cover.removeAttribute('src'); }
    if (track.sunoUrl) { suno.href = track.sunoUrl; suno.hidden = false; suno.setAttribute('aria-label', `${track.title}の続きはSunoでフル再生`); } else suno.hidden = true;
    audio.src = `/audio/${track.id}-preview.mp3`;
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title, artist: 'Kanon Studio', album: '30秒試聴',
        artwork: track.cover ? [{ src: track.cover, sizes: '512x512' }] : [],
      });
    }
  };

  const play = async (id: string) => {
    const track = byId.get(id);
    if (!track) return;
    const currentAttempt = ++attempt;
    status.textContent = '';
    if (dock.dataset.trackId !== id || !audio.src) load(track);
    dock.hidden = false;
    root.documentElement.classList.add('dock-open');
    setState('loading');
    try { await audio.play(); }
    catch (error) {
      if (currentAttempt !== attempt) return;
      setState('paused');
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        status.textContent = track.sunoUrl ? '音源を再生できませんでした。Sunoでお聴きください。' : '音源を再生できませんでした。もう一度お試しください。';
        audio.removeAttribute('src');
      }
    }
  };
  const toggleTrack = (id: string) => {
    if (dock.dataset.trackId === id && dock.dataset.state === 'playing') { audio.pause(); return; }
    if (dock.dataset.trackId === id && dock.dataset.state === 'loading') return;
    void play(id);
  };
  const step = (direction: 1 | -1) => {
    const id = nextTrackId(catalog, dock.dataset.trackId, direction);
    if (id) void play(id);
  };

  audio.addEventListener('playing', () => setState('playing'));
  audio.addEventListener('pause', () => { if (dock.dataset.state !== 'loading') setState('paused'); });
  audio.addEventListener('timeupdate', renderTime);
  audio.addEventListener('loadedmetadata', renderTime);
  audio.addEventListener('ended', () => {
    setState('paused');
    if (continuous.getAttribute('aria-pressed') === 'true' && catalog.length > 1) step(1);
  });
  audio.addEventListener('error', () => {
    if (!audio.getAttribute('src')) return;
    attempt += 1;
    setState('paused');
    status.textContent = '音源を再生できませんでした。もう一度お試しください。';
    audio.removeAttribute('src');
  });

  toggle.addEventListener('click', () => { const id = dock.dataset.trackId ?? catalog[0]?.id; if (id) toggleTrack(id); });
  dock.querySelector('[data-dock-prev]')!.addEventListener('click', () => step(-1));
  dock.querySelector('[data-dock-next]')!.addEventListener('click', () => step(1));
  continuous.addEventListener('click', () => setContinuous(continuous.getAttribute('aria-pressed') !== 'true'));
  seek.addEventListener('input', () => { seeking = true; });
  seek.addEventListener('change', () => { audio.currentTime = Number(seek.value); seeking = false; renderTime(); });
  dock.querySelector('[data-dock-close]')!.addEventListener('click', () => {
    audio.pause();
    dock.hidden = true;
    root.documentElement.classList.remove('dock-open');
    setState('paused');
  });

  // Capture phase: take over page-level play buttons before the per-element fallback player reacts.
  root.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const shelf = target?.closest<HTMLButtonElement>('[data-dock-play]');
    if (shelf) { event.preventDefault(); toggleTrack(shelf.dataset.dockPlay!); return; }
    const button = target?.closest<HTMLButtonElement>('[data-audio-toggle]');
    if (!button) return;
    const id = (button.getAttribute('aria-controls') ?? '').replace(/^audio-/, '');
    if (!byId.has(id)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    toggleTrack(id);
  }, { capture: true, signal: (pageListeners = new AbortController()).signal });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => { const id = dock.dataset.trackId; if (id) void play(id); });
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => step(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => step(1));
  }

  root.documentElement.classList.add('dock-ready');
  renderTime();
  syncButtons();
}

/** Test hook: forget module state between isolated documents. */
export function resetPlayerDockForTests() { ready = false; pageListeners?.abort(); pageListeners = undefined; }
