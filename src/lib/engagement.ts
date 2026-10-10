const API = 'https://kanon-engagement.kanon-kurose.chatgpt.site/api/engagement';
const VISITOR_KEY = 'kanon-visitor-v1';
const SESSION_KEY = 'kanon-visit-v1';
const likedKey = (id: string) => `kanon-liked-v1:${id}`;
const pending = new Set<string>();
function visitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) { id=crypto.randomUUID(); localStorage.setItem(VISITOR_KEY,id); }
  return id;
}
function markLiked(id: string, fresh = false) {
  document.querySelectorAll<HTMLButtonElement>('[data-like-work]').forEach(button => {
    if (button.dataset.likeWork !== id) return;
    button.disabled=true; button.setAttribute('aria-pressed','true');
    button.setAttribute('aria-label',`${button.dataset.likeTitle}にいいね済み`);
    button.querySelector('[data-like-label]')!.textContent='いいね済み';
    const container=button.closest<HTMLElement>('[data-like-container]')!;
    container.querySelector('[data-like-status]')!.textContent=fresh ? 'ありがとう、届きました。' : '';
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
export function initLikes() {
  document.querySelectorAll<HTMLButtonElement>('[data-like-work]').forEach(button => {
    const id=button.dataset.likeWork!;
    const status=button.closest('[data-like-container]')!.querySelector('[data-like-status]')!;
    try { if(localStorage.getItem(likedKey(id))) { markLiked(id); return; } visitorId(); }
    catch { status.textContent='このブラウザでは、いいねを保存できません。'; return; }
    button.disabled=false;
    button.addEventListener('click',async()=> {
      if(pending.has(id) || button.getAttribute('aria-pressed')==='true') return;
      pending.add(id); button.disabled=true; status.textContent='届けています…';
      try {
        const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify({type:'like',workId:id,visitorId:visitorId()})});
        if(!response.ok || !(await response.json()).liked) throw new Error('not saved');
        localStorage.setItem(likedKey(id),'1'); markLiked(id,true);
      } catch { button.disabled=false; status.textContent='届きませんでした。もう一度お試しください。'; }
      finally { pending.delete(id); }
    });
  });
  window.addEventListener('storage',event=> { if(event.key?.startsWith('kanon-liked-v1:') && event.newValue) markLiked(event.key.slice('kanon-liked-v1:'.length)); });
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
