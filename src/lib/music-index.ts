/** Reveal the song choices before native fragment navigation moves focus. */
export function initMusicIndex() {
  const summary = document.getElementById('track-index');
  const index = summary?.closest('details');
  if (!summary || !index || index.dataset.initialized) return;
  index.dataset.initialized = 'true';

  const revealFromHash = () => {
    if (window.location.hash === '#track-index') index.open = true;
  };
  revealFromHash();
  window.addEventListener('hashchange', revealFromHash);

  document.querySelectorAll<HTMLAnchorElement>('.track-index-return').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      index.open = true;
      // Keep the native hash, history, scrolling and keyboard focus behavior.
    });
  });
}
