/** Keep one preview playing at a time; full tracks remain on Suno. */
export function initTrackPlayback(root: Document = document) {
  const players = Array.from(root.querySelectorAll<HTMLAudioElement>('audio[data-track-audio]'));
  players.forEach((player) => {
    const container = player.closest('[data-track-player]');
    const status = container?.querySelector<HTMLElement>('[data-audio-status]');
    player.addEventListener('contextmenu', (event) => event.preventDefault());
    player.addEventListener('play', () => {
      players.forEach((other) => { if (other !== player) other.pause(); });
      if (status) status.textContent = '';
    });
    player.addEventListener('error', () => {
      if (status) status.textContent = '音源を再生できませんでした。下のSunoリンクからお聴きください。';
    });
  });
}
