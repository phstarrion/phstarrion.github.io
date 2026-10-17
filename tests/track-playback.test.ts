import { describe, expect, it, vi } from 'vitest';
import { initTrackPlayback } from '../src/lib/track-playback';

describe('site audio playback', () => {
  const interactivePlayer = () => {
    const page = document.implementation.createHTMLDocument();
    page.body.innerHTML = '<div data-track-player><p class="track-player__label">30秒試聴</p><button type="button" hidden data-audio-toggle data-audio-title="テスト曲" aria-controls="test-audio"><span data-audio-action>30秒試聴</span></button><audio id="test-audio" data-track-audio controls></audio><p role="status" data-audio-status></p></div>';
    return { page, player: page.querySelector('audio')!, button: page.querySelector('button')! };
  };

  it('makes the primary action available and keeps it in sync with native playback', async () => {
    const { page, player, button } = interactivePlayer();
    const play = vi.spyOn(player, 'play').mockImplementation(async () => { player.dispatchEvent(new Event('play')); });
    const pause = vi.spyOn(player, 'pause').mockImplementation(() => { player.dispatchEvent(new Event('pause')); });
    initTrackPlayback(page);
    initTrackPlayback(page); // Enhancing twice must not register duplicate handlers.
    expect(button.hidden).toBe(false);
    expect(button.getAttribute('aria-controls')).toBe(player.id);
    button.focus();
    button.click();
    await vi.waitFor(() => expect(button.textContent).toBe('一時停止'));
    expect(play).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('aria-label')).toContain('テスト曲の試聴を一時停止');
    expect(page.activeElement).toBe(button);
    button.click();
    expect(pause).toHaveBeenCalledTimes(1);
    expect(button.textContent).toBe('30秒試聴');
    player.dispatchEvent(new Event('play'));
    expect(button.textContent).toBe('一時停止');
    player.dispatchEvent(new Event('ended'));
    expect(button.textContent).toBe('30秒試聴');
  });

  it('prevents repeat requests while loading and recovers after playback is rejected', async () => {
    const { page, player, button } = interactivePlayer();
    let reject!: (reason: Error) => void;
    const play = vi.spyOn(player, 'play').mockImplementation(() => new Promise<void>((_, fail) => { reject = fail; }));
    initTrackPlayback(page);
    button.click();
    button.click();
    expect(play).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toBe('読み込み中…');
    reject(new Error('Network unavailable'));
    await vi.waitFor(() => expect(button.getAttribute('aria-disabled')).toBe('false'));
    expect(button.getAttribute('aria-busy')).toBe('false');
    expect(button.textContent).toBe('30秒試聴');
    expect(page.querySelector('[data-audio-status]')?.textContent).toContain('再生できませんでした');
    expect(player.hasAttribute('controls')).toBe(true);
  });

  it('pauses other tracks when either native player starts', () => {
    const page = document.implementation.createHTMLDocument();
    page.body.innerHTML = '<audio data-track-audio></audio><audio data-track-audio></audio>';
    const [first, second] = [...page.querySelectorAll('audio')];
    const pauseFirst = vi.spyOn(first, 'pause');
    const pauseSecond = vi.spyOn(second, 'pause');
    initTrackPlayback(page);
    first.dispatchEvent(new Event('play'));
    expect(pauseSecond).toHaveBeenCalledTimes(1);
    expect(pauseFirst).not.toHaveBeenCalled();
    second.dispatchEvent(new Event('play'));
    expect(pauseFirst).toHaveBeenCalledTimes(1);
  });

  it.each(['source', 'audio'])('recovers from a %s error even while play is pending', async (target) => {
    const { page, player, button } = interactivePlayer();
    const source = page.createElement('source');
    player.append(source);
    const fallback = page.createElement('a');
    fallback.className = 'track-player__suno';
    player.parentElement!.append(fallback);
    let rejectFirst!: (reason: Error) => void;
    let finishRetry!: () => void;
    const play = vi.spyOn(player, 'play')
      .mockImplementationOnce(() => new Promise<void>((_, reject) => { rejectFirst = reject; }))
      .mockImplementationOnce(() => new Promise<void>((resolve) => { finishRetry = resolve; }));
    const reload = vi.spyOn(player, 'load').mockImplementation(() => {});
    vi.spyOn(player, 'pause').mockImplementation(() => player.dispatchEvent(new Event('pause')));
    initTrackPlayback(page);
    button.click();
    (target === 'source' ? source : player).dispatchEvent(new Event('error'));
    expect(button.getAttribute('aria-busy')).toBe('false');
    expect(button.getAttribute('aria-disabled')).toBe('false');
    expect(button.textContent).toBe('30秒試聴');
    expect(page.querySelector('[data-audio-status]')?.textContent).toContain('Suno');
    button.click();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledTimes(2);
    rejectFirst(new DOMException('Previous playback aborted', 'AbortError'));
    await Promise.resolve();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(page.querySelector('[data-audio-status]')?.textContent).toBe('');
    player.dispatchEvent(new Event('play'));
    finishRetry();
    await vi.waitFor(() => expect(button.textContent).toBe('一時停止'));
    expect(button.getAttribute('aria-busy')).toBe('false');
  });

  it('offers a fallback after an audio error and clears it after playback resumes', () => {
    const page = document.implementation.createHTMLDocument();
    page.body.innerHTML = '<div data-track-player><a class="track-player__suno" href="https://suno.com/">Suno</a><audio data-track-audio></audio><p role="status" data-audio-status></p></div>';
    initTrackPlayback(page);
    const player = page.querySelector('audio')!;
    player.dispatchEvent(new Event('error'));
    expect(page.querySelector('[data-audio-status]')?.textContent).toContain('Suno');
    player.dispatchEvent(new Event('play'));
    expect(page.querySelector('[data-audio-status]')?.textContent).toBe('');
  });
  it('suppresses the audio context menu', () => {
    const page = document.implementation.createHTMLDocument();
    page.body.innerHTML = '<audio data-track-audio></audio>';
    initTrackPlayback(page);
    const event = new Event('contextmenu', { cancelable: true });
    page.querySelector('audio')!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
