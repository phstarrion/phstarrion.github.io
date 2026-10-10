import { describe, expect, it, vi } from 'vitest';
import { initTrackPlayback } from '../src/lib/track-playback';

describe('site audio playback', () => {
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

  it('offers a fallback after an audio error and clears it after playback resumes', () => {
    const page = document.implementation.createHTMLDocument();
    page.body.innerHTML = '<div data-track-player><audio data-track-audio></audio><p role="status" data-audio-status></p></div>';
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
