/** Playback URLs are requested on a deliberate play action, never baked into HTML. */
export function initTrackPlayback(root: Document = document) {
  const players = Array.from(root.querySelectorAll<HTMLAudioElement>('audio[data-track-audio]'));
  players.forEach((player) => {
    const container = player.closest('[data-track-player]');
    const status = container?.querySelector<HTMLElement>('[data-audio-status]');
    const start = container?.querySelector<HTMLButtonElement>('[data-audio-start]');
    player.addEventListener('contextmenu', (event) => event.preventDefault());
    start?.addEventListener('click', async () => {
      start.disabled = true;
      if (status) status.textContent = '音源を準備しています…';
      try {
        const response = await fetch(`${start.dataset.endpoint}/session`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
          body: JSON.stringify({ track: start.dataset.trackId, mode: start.dataset.mode }),
        });
        if (!response.ok) throw new Error('Audio session failed');
        const session = await response.json();
        const url = new URL(session.url);
        if (url.origin !== new URL(start.dataset.endpoint!).origin || url.protocol !== 'https:') throw new Error('Unexpected audio host');
        player.src = url.href;
        player.hidden = false;
        player.load();
        await player.play();
        start.hidden = true;
        if (status) status.textContent = '';
      } catch {
        if (status) status.textContent = '再生を開始できませんでした。もう一度押すか、Sunoでお聴きください。';
      } finally { start.disabled = false; }
    });
    player.addEventListener('play', () => {
      players.forEach((other) => { if (other !== player) other.pause(); });
      if (status) status.textContent = '';
    });
    player.addEventListener('error', () => {
      if (start) start.hidden = false;
      if (status) status.textContent = '音源を再生できませんでした。もう一度押すか、下のSunoリンクからも聴けます。';
    });
  });
}
