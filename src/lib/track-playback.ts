/** Keep one preview playing at a time; full tracks remain on Suno. */
export function initTrackPlayback(root: Document = document) {
  const players = Array.from(root.querySelectorAll<HTMLAudioElement>('audio[data-track-audio]'));
  players.forEach((player) => {
    if (player.dataset.playbackInitialized) return;
    player.dataset.playbackInitialized = 'true';
    const container = player.closest('[data-track-player]');
    const status = container?.querySelector<HTMLElement>('[data-audio-status]');
    const toggle = container?.querySelector<HTMLButtonElement>('[data-audio-toggle]');
    const action = toggle?.querySelector<HTMLElement>('[data-audio-action]');
    let playing = !player.paused && !player.ended;
    let loading = false;
    let attempt = 0;
    let needsReload = false;
    const render = () => {
      if (!toggle) return;
      toggle.setAttribute('aria-disabled', String(loading));
      toggle.setAttribute('aria-busy', String(loading));
      toggle.dataset.playState = playing ? 'playing' : 'paused';
      const title = toggle.dataset.audioTitle ?? 'この曲';
      if (action) action.textContent = loading ? '読み込み中…' : playing ? '一時停止' : '30秒試聴';
      toggle.setAttribute('aria-label', loading ? `${title}の音源を読み込み中` : playing ? `${title}の試聴を一時停止する` : `${title}を30秒試聴する`);
    };
    const reportError = () => {
      if (status) status.textContent = container?.querySelector('.track-player__suno')
        ? '音源を再生できませんでした。下のSunoリンクからお聴きください。'
        : '音源を再生できませんでした。ページを再読み込みしてお試しください。';
    };
    if (toggle) {
      toggle.addEventListener('click', async () => {
        if (loading) return;
        if (playing) { player.pause(); return; }
        loading = true;
        const currentAttempt = ++attempt;
        if (status) status.textContent = '';
        render();
        try {
          if (needsReload) { player.load(); needsReload = false; }
          await player.play();
        }
        catch (error) {
          if (currentAttempt !== attempt) return;
          playing = false;
          if (!(error instanceof DOMException && error.name === 'AbortError')) reportError();
        } finally {
          if (currentAttempt === attempt) { loading = false; render(); }
        }
      });
      render();
      toggle.hidden = false;
      const label = container?.querySelector<HTMLElement>('.track-player__label');
      if (label) label.hidden = true;
    }
    player.addEventListener('contextmenu', (event) => event.preventDefault());
    player.addEventListener('play', () => {
      playing = true;
      render();
      players.forEach((other) => { if (other !== player) other.pause(); });
      if (status) status.textContent = '';
    });
    player.addEventListener('pause', () => { playing = false; render(); });
    player.addEventListener('ended', () => { playing = false; render(); });
    const handleMediaError = () => {
      // A failed <source> may leave play() pending. Invalidate that request
      // before allowing retry, so its eventual rejection cannot reset the UI.
      attempt++;
      loading = false;
      playing = false;
      needsReload = true;
      player.pause();
      render();
      reportError();
    };
    player.addEventListener('error', handleMediaError);
    // The preview has one MP3 source; source errors do not bubble to audio.
    player.querySelectorAll('source').forEach((source) => {
      source.addEventListener('error', handleMediaError);
    });
  });
}
