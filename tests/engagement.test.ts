import {beforeEach,afterEach,it,expect,vi} from 'vitest';
beforeEach(()=> {document.body.innerHTML='<div data-like-container><button data-like-work="hodoke" data-like-title="ほどけ" aria-pressed="false" disabled><span data-like-label>いいね</span></button><span data-like-status></span></div>';localStorage.clear();Object.defineProperty(navigator,'doNotTrack',{value:null,configurable:true});vi.resetModules();});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
it('locks repeated clicks, saves only confirmed likes, and restores the liked state',async()=> {
  const send=vi.fn().mockResolvedValue(Response.json({liked:true}));vi.stubGlobal('fetch',send);
  const {initLikes}=await import('../src/lib/engagement');initLikes();
  const button=document.querySelector<HTMLButtonElement>('button')!;button.click();button.click();
  await vi.waitFor(()=>expect(button.getAttribute('aria-pressed')).toBe('true'));
  expect(send).toHaveBeenCalledTimes(1);expect(button.disabled).toBe(true);expect(localStorage.getItem('kanon-liked-v1:hodoke')).toBe('1');
  expect(document.querySelector('[data-like-status]')?.textContent).toContain('ありがとう');
  expect(JSON.parse(send.mock.calls[0][1].body).workId).toBe('hodoke');
  document.body.innerHTML='<div data-like-container><button data-like-work="hodoke" data-like-title="ほどけ" aria-pressed="false"><span data-like-label></span></button><span data-like-status></span></div>';initLikes();
  expect(document.querySelector<HTMLButtonElement>('button')?.disabled).toBe(true);
});
it('failed requests do not falsely accept a like and allow retry',async()=> {
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('',{status:503})));
  const {initLikes}=await import('../src/lib/engagement');initLikes();document.querySelector<HTMLButtonElement>('button')!.click();
  await vi.waitFor(()=>expect(document.querySelector('[data-like-status]')?.textContent).toContain('届きませんでした'));
  expect(localStorage.getItem('kanon-liked-v1:hodoke')).toBeNull();expect(document.querySelector<HTMLButtonElement>('button')?.disabled).toBe(false);
});
it('preserves UTM entry attribution across page navigation and sends only a referrer hostname',async()=> {
  const send=vi.fn().mockResolvedValue(Response.json({ok:true}));vi.stubGlobal('fetch',send);
  window.history.replaceState({},'','/music/?utm_source=x&utm_campaign=pinned_reply');
  vi.spyOn(document,'referrer','get').mockReturnValue('https://t.co/private-path?secret=do-not-save');
  const {recordVisit}=await import('../src/lib/engagement');await recordVisit();
  const first=JSON.parse(send.mock.calls[0][1].body);expect(first.source).toBe('x');expect(first.campaign).toBe('pinned_reply');expect(first.referrerHost).toBe('t.co');expect(send.mock.calls[0][1].body).not.toContain('private-path');
  await recordVisit();expect(JSON.parse(send.mock.calls[1][1].body).sessionId).toBe(first.sessionId);
  window.history.replaceState({},'','/works/hodoke/');vi.spyOn(document,'referrer','get').mockReturnValue(`${location.origin}/music/`);await recordVisit();
  const next=JSON.parse(send.mock.calls[2][1].body);expect(next.source).toBe('x');expect(next.sessionId).toBe(first.sessionId);
});
it('respects Do Not Track for visit collection',async()=> {
  const send=vi.fn();vi.stubGlobal('fetch',send);Object.defineProperty(navigator,'doNotTrack',{value:'1',configurable:true});
  const {recordVisit}=await import('../src/lib/engagement');await recordVisit();expect(send).not.toHaveBeenCalled();
});
