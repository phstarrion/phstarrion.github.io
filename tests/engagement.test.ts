import { beforeEach, afterEach, it, expect, vi } from 'vitest';
const markup = '<div data-like-container><button data-like-work="hodoke" data-like-title="ほどけ" aria-pressed="false" disabled><span data-like-label>いいね</span></button><span data-like-status></span></div>';
const key = 'kanon-like-outbox-v1:hodoke';
const button = () => document.querySelector<HTMLButtonElement>('button')!;
const status = () => document.querySelector('[data-like-status]')!.textContent;
let listeners: { type: string; listener: EventListenerOrEventListenerObject }[];
beforeEach(() => {
  vi.useFakeTimers(); vi.resetModules(); document.body.innerHTML = markup; localStorage.clear();
  Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true });
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  listeners = [];
  const original = window.addEventListener.bind(window);
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    listeners.push({ type, listener }); original(type, listener, options);
  });
});
afterEach(() => {
  for (const { type, listener } of listeners) window.removeEventListener(type, listener);
  vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals();
});
const settle = () => vi.advanceTimersByTimeAsync(0);

it('records the intent first, reacts immediately, deduplicates buttons and confirms only after saving', async () => {
  let resolve!: (response: Response) => void;
  const send = vi.fn((_url: string, _options: RequestInit) => new Promise<Response>(done => { resolve = done; })); vi.stubGlobal('fetch', send);
  document.body.innerHTML += markup;
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); initLikes();
  button().click();
  expect(localStorage.getItem(key)).not.toBeNull();
  expect(localStorage.getItem('kanon-liked-v1:hodoke')).toBeNull();
  expect(status()).toContain('送信中');
  for (const b of document.querySelectorAll<HTMLButtonElement>('button')) { expect(b.disabled).toBe(true); expect(b.getAttribute('aria-pressed')).toBe('true'); b.click(); }
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][1].keepalive).toBe(true);
  resolve(Response.json({ liked: true })); await settle();
  expect(localStorage.getItem(key)).toBeNull(); expect(localStorage.getItem('kanon-liked-v1:hodoke')).toBe('1');
  expect(status()).toContain('届きました');
  document.body.innerHTML = markup; initLikes(); expect(button().disabled).toBe(true);
});
it('retries a temporary failure with the same visitor and preserves the heart while waiting', async () => {
  const send = vi.fn().mockRejectedValueOnce(new TypeError('network')).mockResolvedValue(Response.json({ liked: true })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); button().click(); await settle();
  expect(button().getAttribute('aria-pressed')).toBe('true'); expect(status()).toContain('自動'); expect(status()).not.toContain('届きました');
  await vi.advanceTimersByTimeAsync(2000);
  expect(status()).toContain('届きました'); expect(send).toHaveBeenCalledTimes(2);
  expect(send.mock.calls[0][1].body).toBe(send.mock.calls[1][1].body);
});
it('keeps permanent rejections for manual retry without endless background requests', async () => {
  const send = vi.fn().mockResolvedValue(new Response('', { status: 400 })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); button().click(); await settle();
  expect(localStorage.getItem(key)).not.toBeNull(); expect(button().disabled).toBe(false); expect(button().textContent).toContain('再送');
  await vi.advanceTimersByTimeAsync(60000); expect(send).toHaveBeenCalledTimes(1);
  send.mockResolvedValue(Response.json({ liked: true })); button().click(); await settle(); expect(status()).toContain('届きました');
});
it('bounds automatic retries and retains an unsent like after repeated failures', async () => {
  const send = vi.fn().mockResolvedValue(new Response('', { status: 503 })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); button().click(); await settle();
  await vi.advanceTimersByTimeAsync(7000); expect(send).toHaveBeenCalledTimes(3);
  await vi.advanceTimersByTimeAsync(60000); expect(send).toHaveBeenCalledTimes(3);
  expect(localStorage.getItem(key)).not.toBeNull(); expect(localStorage.getItem('kanon-liked-v1:hodoke')).toBeNull();
  expect(button().getAttribute('aria-pressed')).toBe('true'); expect(status()).toContain('保持');
});
it('restores pending likes on a different page using their original visitor identity', async () => {
  const visitorId = crypto.randomUUID(); localStorage.setItem(key, JSON.stringify({ visitorId, nextAt: 0 }));
  localStorage.setItem('kanon-like-outbox-v1:corrupt', '{'); document.body.innerHTML = '';
  const send = vi.fn().mockResolvedValue(Response.json({ liked: true })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); await settle();
  expect(JSON.parse(send.mock.calls[0][1].body)).toEqual({ type: 'like', workId: 'hodoke', visitorId });
  expect(localStorage.getItem(key)).toBeNull(); expect(localStorage.getItem('kanon-liked-v1:hodoke')).toBe('1');
});
it('waits offline and sends automatically once the connection returns', async () => {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  const send = vi.fn().mockResolvedValue(Response.json({ liked: true })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); button().click(); await settle();
  expect(send).not.toHaveBeenCalled(); expect(localStorage.getItem(key)).not.toBeNull();
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true); window.dispatchEvent(new Event('online')); await settle();
  expect(send).toHaveBeenCalledTimes(1); expect(status()).toContain('届きました');
});
it('times out hanging delivery and frees it for retry', async () => {
  const send = vi.fn((_url, options) => new Promise<Response>((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('timeout', 'AbortError')));
  })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); button().click();
  await vi.advanceTimersByTimeAsync(8000); expect(status()).toContain('自動');
  expect(localStorage.getItem(key)).not.toBeNull(); await vi.advanceTimersByTimeAsync(2000); expect(send).toHaveBeenCalledTimes(2);
});
it('honors a rate-limit delay before sending again', async () => {
  const send = vi.fn().mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '30' } })).mockResolvedValue(Response.json({ liked: true })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); button().click(); await settle();
  await vi.advanceTimersByTimeAsync(29999); expect(send).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1); expect(status()).toContain('届きました');
});
it('can send a like when browser storage is unavailable', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  const send = vi.fn().mockResolvedValue(Response.json({ liked: true })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); button().click(); await settle();
  expect(send).toHaveBeenCalledTimes(1); expect(status()).toContain('届きました');
});
it('preserves UTM entry attribution across page navigation and sends only a referrer hostname', async () => {
  const send = vi.fn().mockResolvedValue(Response.json({ ok: true })); vi.stubGlobal('fetch', send);
  window.history.replaceState({}, '', '/music/?utm_source=x&utm_campaign=pinned_reply');
  vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://t.co/private-path?secret=do-not-save');
  const { recordVisit } = await import('../src/lib/engagement'); await recordVisit();
  const first = JSON.parse(send.mock.calls[0][1].body); expect(first.source).toBe('x'); expect(first.campaign).toBe('pinned_reply'); expect(first.referrerHost).toBe('t.co'); expect(send.mock.calls[0][1].body).not.toContain('private-path');
  window.history.replaceState({}, '', '/works/hodoke/'); vi.spyOn(document, 'referrer', 'get').mockReturnValue(`${location.origin}/music/`); await recordVisit();
  const next = JSON.parse(send.mock.calls[1][1].body); expect(next.source).toBe('x'); expect(next.sessionId).toBe(first.sessionId);
});
it('respects Do Not Track for visit collection', async () => {
  const send = vi.fn(); vi.stubGlobal('fetch', send); Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
  const { recordVisit } = await import('../src/lib/engagement'); await recordVisit(); expect(send).not.toHaveBeenCalled();
});

it('ignores an invalid Retry-After rather than losing a queued like', async () => {
  const send = vi.fn().mockResolvedValueOnce(new Response('', { status: 503, headers: { 'Retry-After': 'invalid' } })).mockResolvedValue(Response.json({ liked: true })); vi.stubGlobal('fetch', send);
  const { initLikes } = await import('../src/lib/engagement'); initLikes(); button().click(); await settle();
  expect(Number.isFinite(JSON.parse(localStorage.getItem(key)!).nextAt)).toBe(true);
  await vi.advanceTimersByTimeAsync(2000); expect(status()).toContain('届きました');
});
