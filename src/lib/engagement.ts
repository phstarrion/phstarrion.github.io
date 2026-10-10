const API = 'https://kanon-engagement.kanon-kurose.chatgpt.site/api/engagement';
const VISITOR_KEY = 'kanon-visitor-v1';
const SESSION_KEY = 'kanon-visit-v1';
const likedKey = (id: string) => `kanon-liked-v1:${id}`;
const pending = new Set<string>();
const OUTBOX_PREFIX = 'kanon-like-outbox-v1:';
interface QueuedLike { visitorId: string; nextAt: number; notBefore?: number; }
const outbox = new Map<string, QueuedLike>();
const confirmed = new Set<string>();
const attempts = new Map<string, number>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const initialized = new WeakSet<HTMLButtonElement>();
let eventsReady = false;
let memoryVisitor: string | undefined;
function readStorage(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function persist(id: string, entry: QueuedLike) {
  try { localStorage.setItem(OUTBOX_PREFIX + id, JSON.stringify(entry)); return true; } catch { return false; }
}
function removeQueued(id: string) {
  outbox.delete(id);
  if (timers.has(id)) clearTimeout(timers.get(id));
  timers.delete(id);
  try { localStorage.removeItem(OUTBOX_PREFIX + id); } catch { /* Memory state still works. */ }
}
function visitorId() {
  let id = readStorage(VISITOR_KEY);
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
    id = memoryVisitor ??= crypto.randomUUID();
    try { localStorage.setItem(VISITOR_KEY, id); } catch { /* Page-local fallback. */ }
  }
  return id;
}
function markLiked(id: string, fresh = false, message = '') {
  document.querySelectorAll<HTMLButtonElement>('[data-like-work]').forEach(button => {
    if (button.dataset.likeWork !== id) return;
    button.disabled=true; button.setAttribute('aria-pressed','true');
    button.setAttribute('aria-label',`${button.dataset.likeTitle}にいいね済み`);
    button.querySelector('[data-like-label]')!.textContent='いいね済み';
    const container=button.closest<HTMLElement>('[data-like-container]')!;
    container.querySelector('[data-like-status]')!.textContent=message || (fresh ? 'ありがとう、届きました。' : '');
    if (!fresh || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for(let n=0;n<8;n++) {
      const spark=document.createElement('span'); spark.className='like-sparkle';
      spark.textContent=n%3===0 ? '♥' : '✦'; spark.setAttribute('aria-hidden','true');
      const angle=n/8*Math.PI*2;
      spark.style.setProperty('--spark-x',`${Math.cos(angle)*45}px`);
      spark.style.setProperty('--spark-y',`${Math.sin(angle)*35-24}px`);
      spark.style.setProperty('--spark-rotation',`${n%2===0 ? 30 : -30}deg`);
      container.append(spark); spark.addEventListener('animationend',()=>spark.remove(),{once:true});
      window.setTimeout(()=>spark.remove(),1200);
    }
  });
}
function showQueued(id: string, message: string, retry = false) {
  markLiked(id, false, message);
  document.querySelectorAll<HTMLButtonElement>('[data-like-work]').forEach(button => {
    if (button.dataset.likeWork !== id) return;
    button.disabled = !retry;
    button.setAttribute('aria-busy', String(pending.has(id)));
    if (retry) {
      button.querySelector('[data-like-label]')!.textContent = 'いいねを再送';
      button.setAttribute('aria-label', `${button.dataset.likeTitle}にいいねを再送`);
    }
  });
}
function schedule(id: string) {
  const entry = outbox.get(id);
  if (!entry || timers.has(id) || navigator.onLine === false) return;
  timers.set(id, setTimeout(() => {
    timers.delete(id);
    void sendLike(id);
  }, Math.max(0, entry.nextAt - Date.now())));
}
async function sendLike(id: string) {
  const entry = outbox.get(id);
  if (!entry || pending.has(id) || confirmed.has(id)) return;
  if (readStorage(likedKey(id))) { confirmed.add(id); removeQueued(id); markLiked(id); return; }
  if (navigator.onLine === false) {
    showQueued(id, 'ありがとう。接続が戻ったら送信します。');
    return;
  }
  if (entry.nextAt > Date.now()) { showQueued(id, 'いいねを保持しています。まもなく再送します。'); schedule(id); return; }
  pending.add(id);
  showQueued(id, 'ありがとう、送信中…');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let transient = true;
  let retryAfter = 0;
  try {
    const response = await fetch(API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
      keepalive: true, signal: controller.signal,
      body: JSON.stringify({ type: 'like', workId: id, visitorId: entry.visitorId }),
    });
    transient = response.status === 429 || response.status === 408 || response.status >= 500;
    const retryHeader = response.headers.get('Retry-After');
    if (retryHeader) {
      const seconds = Number(retryHeader);
      const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryHeader) - Date.now();
      if (Number.isFinite(delay)) retryAfter = Math.max(0, delay);
    }
    if (!response.ok) throw new Error('not saved');
    transient = true; // An unreadable success response may have saved the like: retry the same ID.
    if ((await response.json()).liked !== true) throw new Error('not confirmed');
    confirmed.add(id);
    try { localStorage.setItem(likedKey(id), '1'); } catch { /* Server confirmation is authoritative. */ }
    removeQueued(id);
    markLiked(id, false, 'ありがとう、届きました。');
  } catch {
    if (confirmed.has(id)) return;
    const count = (attempts.get(id) ?? 0) + 1;
    attempts.set(id, count);
    entry.notBefore = Date.now() + retryAfter;
    entry.nextAt = Date.now() + Math.max(retryAfter, [2000, 5000, 15000][Math.min(count - 1, 2)]);
    const saved = persist(id, entry);
    const automatic = transient && count < 3;
    showQueued(id, automatic
      ? (saved ? 'ありがとう。いいねを保持し、自動で再送します。' : 'ありがとう。このページで自動再送します。')
      : (saved ? 'いいねは保持しています。再送するか、次回の訪問時に送信します。' : '送信を待っています。もう一度再送できます。'), !automatic);
    if (automatic) schedule(id);
  } finally {
    clearTimeout(timeout);
    pending.delete(id);
    document.querySelectorAll<HTMLButtonElement>('[data-like-work]').forEach(button => {
      if (button.dataset.likeWork === id) button.setAttribute('aria-busy', 'false');
    });
  }
}
function restoreQueue() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(OUTBOX_PREFIX)) continue;
      const id = key.slice(OUTBOX_PREFIX.length);
      let entry;
      try { entry = JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { continue; }
      if (/^[a-z0-9-]+$/.test(id) && typeof entry?.visitorId === 'string' && /^[a-f0-9-]{36}$/i.test(entry.visitorId) && Number.isFinite(entry.nextAt)) {
        if (readStorage(likedKey(id))) removeQueued(id);
        else if (!outbox.has(id)) outbox.set(id, entry);
      }
    }
  } catch { /* Storage may be unavailable; page-local delivery still works. */ }
}
export function initLikes() {
  restoreQueue();
  document.querySelectorAll<HTMLButtonElement>('[data-like-work]').forEach(button => {
    const id = button.dataset.likeWork!;
    if (confirmed.has(id) || readStorage(likedKey(id))) { markLiked(id); return; }
    if (outbox.has(id)) showQueued(id, 'いいねを保持しています。送信を再開します。');
    else button.disabled = false;
    if (initialized.has(button)) return;
    initialized.add(button);
    button.addEventListener('click', () => {
      if (pending.has(id) || confirmed.has(id) || readStorage(likedKey(id))) return;
      if (!outbox.has(id)) {
        const entry = { visitorId: visitorId(), nextAt: 0 };
        outbox.set(id, entry);
        persist(id, entry); // Record intent before starting the network request.
        markLiked(id, true, 'ありがとう、送信中…');
      }
      attempts.set(id, 0);
      const entry = outbox.get(id)!;
      entry.nextAt = Math.max(Date.now(), Number.isFinite(entry.notBefore) ? entry.notBefore! : 0);
      if (timers.has(id)) { clearTimeout(timers.get(id)); timers.delete(id); }
      void sendLike(id);
    });
  });
  if (!eventsReady) {
    eventsReady = true;
    window.addEventListener('online', () => {
      outbox.forEach((_entry, id) => { attempts.set(id, 0); schedule(id); });
    });
    window.addEventListener('pageshow', () => { restoreQueue(); outbox.forEach((_entry, id) => schedule(id)); });
    window.addEventListener('storage', event => {
      if (event.key?.startsWith('kanon-liked-v1:') && event.newValue) {
        const id = event.key.slice('kanon-liked-v1:'.length);
        confirmed.add(id); removeQueued(id); markLiked(id);
      } else if (event.key?.startsWith(OUTBOX_PREFIX) && event.newValue) {
        restoreQueue(); outbox.forEach((_entry, id) => schedule(id));
      }
    });
  }
  outbox.forEach((_entry, id) => { if (!pending.has(id)) schedule(id); });
}
export async function recordVisit() {
  if(navigator.doNotTrack==='1' || (navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl) return;
  try {
    const now=Date.now(); const params=new URLSearchParams(location.search);
    const source=params.get('utm_source')?.toLowerCase() ?? '';
    const campaign=params.get('utm_campaign')?.toLowerCase() ?? '';
    let host=''; try { host=document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* unknown */ }
    const external=Boolean(host && host!==location.hostname);
    let session=JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
    if(!session || typeof session.id!=='string' || now-session.last>30*60*1000 || external && host!==session.referrerHost || source && (source!==session.source || campaign!==session.campaign)) session={id:crypto.randomUUID(),source,campaign,referrerHost:external ? host : '',last:now};
    session.last=now; localStorage.setItem(SESSION_KEY,JSON.stringify(session));
    await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true,body:JSON.stringify({type:'view',sessionId:session.id,path:location.pathname,source:session.source,campaign:session.campaign,referrerHost:session.referrerHost})});
  } catch { /* Optional measurement never blocks works or playback. */ }
}
