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
  it('obtains a temporary URL only after a play action and hides save menus', async () => {
    const page = document.implementation.createHTMLDocument();
    page.body.innerHTML = '<div data-track-player><button data-audio-start data-endpoint="https://audio.example" data-track-id="hodoke" data-mode="full"></button><audio hidden data-track-audio></audio><p data-audio-status></p></div>';
    const fetchSession = vi.fn(async () => ({ ok: true, json: async () => ({ url: 'https://audio.example/stream?signature=test' }) }));
    vi.stubGlobal('fetch', fetchSession);
    const audio = page.querySelector('audio')!;
    vi.spyOn(audio, 'load').mockImplementation(() => {});
    vi.spyOn(audio, 'play').mockResolvedValue(undefined);
    initTrackPlayback(page);
    expect(fetchSession).not.toHaveBeenCalled();
    const menu = new Event('contextmenu', { cancelable: true }); audio.dispatchEvent(menu);
    expect(menu.defaultPrevented).toBe(true);
    const button = page.querySelector('button')!; button.click();
    await vi.waitFor(() => expect(button.hidden).toBe(true));
    expect(fetchSession).toHaveBeenCalledWith('https://audio.example/session', expect.objectContaining({ method: 'POST' }));
    expect(audio.hidden).toBe(false);
    vi.unstubAllGlobals();
  });

});
