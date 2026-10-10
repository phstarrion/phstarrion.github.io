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
        if (status) status.textContent = '';
        render();
        try { await player.play(); }
        catch (error) {
          playing = false;
          if (!(error instanceof DOMException && error.name === 'AbortError')) reportError();
        } finally { loading = false; render(); }
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
    player.addEventListener('error', () => {
      playing = false;
      render();
      reportError();
    });
  });
}
