// @vitest-environment node
import { describe, expect, it, vi, afterEach } from 'vitest';
import worker from '../services/audio-gateway/worker.mjs';
const origin = 'https://phstarrion.github.io';
const ip = '192.0.2.1';
const env = () => ({ ALLOWED_ORIGIN: origin, SIGNING_SECRET: 'test-only-secret-that-is-at-least-32-characters', SESSION_LIMITER: { limit: vi.fn(async () => ({ success: true })) }, AUDIO: { get: vi.fn(async () => ({ body: new Uint8Array([1, 2, 3]), size: 100, range: { offset: 0, length: 3 } })) } });
async function session(e: ReturnType<typeof env>) {
  const response = await worker.fetch(new Request('https://audio.example/session', { method: 'POST', headers: { Origin: origin, 'CF-Connecting-IP': ip, 'Content-Type': 'application/json' }, body: JSON.stringify({ track: 'hodoke', mode: 'full' }) }), e);
  expect(response.status).toBe(200);
  return (await response.json()).url as string;
}
const stream = (url: string, overrides = {}) => new Request(url, { headers: { Referer: `${origin}/works/hodoke/`, 'CF-Connecting-IP': ip, ...overrides } });
afterEach(() => vi.useRealTimers());
describe('private audio gateway', () => {
  it('supports byte-range playback without exposing the private bucket', async () => {
    const e = env(); const url = await session(e);
    const response = await worker.fetch(stream(url, { Range: 'bytes=0-2' }), e);
    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 0-2/100');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(e.AUDIO.get).toHaveBeenCalledWith('hodoke-full.mp3', expect.anything());
  });
  it('rejects modified track, signature, IP, and unrelated website before reading storage', async () => {
    const e = env(); const url = await session(e);
    const changed = new URL(url); changed.searchParams.set('track', 'bitcoin-ga-ippai');
    const badSignature = new URL(url); badSignature.searchParams.set('signature', '0'.repeat(64));
    for (const request of [stream(changed.href), stream(badSignature.href), stream(url, { 'CF-Connecting-IP': '192.0.2.2' }), stream(url, { Referer: 'https://other.example/' }), new Request(url, { headers: { 'CF-Connecting-IP': ip } })]) {
      expect((await worker.fetch(request, e)).status).toBe(403);
    }
    expect(e.AUDIO.get).not.toHaveBeenCalled();
  });
  it('rejects a previously valid URL after expiry', async () => {
    vi.useFakeTimers(); const e = env(); const url = await session(e);
    vi.advanceTimersByTime(601_000);
    expect((await worker.fetch(stream(url), e)).status).toBe(403);
    expect(e.AUDIO.get).not.toHaveBeenCalled();
  });
  it('refuses sessions from other origins and applies the rate limit', async () => {
    const e = env();
    expect((await worker.fetch(new Request('https://audio.example/session', { method: 'POST', headers: { Origin: 'https://other.example', 'CF-Connecting-IP': ip } }), e)).status).toBe(403);
    e.SESSION_LIMITER.limit.mockResolvedValue({ success: false });
    const request = new Request('https://audio.example/session', { method: 'POST', headers: { Origin: origin, 'CF-Connecting-IP': ip } });
    expect((await worker.fetch(request, e)).status).toBe(429);
  });
  it('fails closed without signing configuration', async () => {
    expect((await worker.fetch(stream('https://audio.example/stream'), { ...env(), SIGNING_SECRET: '' })).status).toBe(503);
  });
});
