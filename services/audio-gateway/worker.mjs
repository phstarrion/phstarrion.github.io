// Public listening with expiring, IP-bound bearer URLs. This is deterrence, not DRM.
const TRACKS = new Set(['bitcoin-ga-ippai', 'hodoke']);
const TTL = 600;
const encoder = new TextEncoder();
async function signingKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function sign(secret, value) {
  const result = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(value));
  return Array.from(new Uint8Array(result), (x) => x.toString(16).padStart(2, '0')).join('');
}
async function verify(secret, value, signature) {
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;
  const bytes = Uint8Array.from(signature.match(/../g), (x) => parseInt(x, 16));
  return crypto.subtle.verify('HMAC', await signingKey(secret), bytes, encoder.encode(value));
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN;
    const headers = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    const reply = (message, status) => new Response(message, { status, headers });
    if (!env.SIGNING_SECRET || env.SIGNING_SECRET.length < 32 || !env.AUDIO || !env.SESSION_LIMITER || !origin) return reply('Unavailable', 503);
    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip) return reply('Unavailable', 503);
    if (url.pathname === '/session') {
      if (request.headers.get('Origin') !== origin) return reply('Forbidden', 403);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
      if (request.method !== 'POST') return reply('Method not allowed', 405);
      if (!(await env.SESSION_LIMITER.limit({ key: ip })).success) return reply('Too many requests', 429);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply('JSON required', 415);
      // Bound the body before parsing, including requests without Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return reply('Invalid request', 400);
      let body = '';
      let size = 0;
      const decoder = new TextDecoder();
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > 1024) { await reader.cancel(); return reply('Request too large', 413); }
        body += decoder.decode(part.value, { stream: true });
      }
      body += decoder.decode();
      let input;
      try { input = JSON.parse(body); } catch { return reply('Invalid request', 400); }
      if (!input || !TRACKS.has(input.track) || !['preview', 'full'].includes(input.mode)) return reply('Unknown track', 400);
      const expires = Math.floor(Date.now() / 1000) + TTL;
      const nonce = crypto.randomUUID();
      const signature = await sign(env.SIGNING_SECRET, `${input.track}|${input.mode}|${expires}|${nonce}|${ip}`);
      const stream = new URL('/stream', url.origin);
      stream.search = new URLSearchParams({ track: input.track, mode: input.mode, expires: String(expires), nonce, signature }).toString();
      return new Response(JSON.stringify({ url: stream.href, expiresAt: expires * 1000 }), { headers: { ...headers, 'Content-Type': 'application/json' } });
    }
    if (url.pathname !== '/stream') return reply('Not found', 404);
    if (!['GET', 'HEAD'].includes(request.method)) return reply('Method not allowed', 405);
    // A pasted URL or another site's embed cannot use the standard browser path.
    let referringOrigin;
    try { referringOrigin = new URL(request.headers.get('Referer')).origin; } catch { return reply('Forbidden', 403); }
    if (referringOrigin !== origin) return reply('Forbidden', 403);
    const track = url.searchParams.get('track');
    const mode = url.searchParams.get('mode');
    const expiresText = url.searchParams.get('expires') || '';
    const expires = Number(expiresText);
    const nonce = url.searchParams.get('nonce') || '';
    const now = Math.floor(Date.now() / 1000);
    if (!TRACKS.has(track) || !['preview', 'full'].includes(mode) || !/^\d+$/.test(expiresText) || expires <= now || expires > now + TTL || !/^[a-f0-9-]{36}$/.test(nonce)) return reply('Forbidden', 403);
    if (!await verify(env.SIGNING_SECRET, `${track}|${mode}|${expires}|${nonce}|${ip}`, url.searchParams.get('signature') || '')) return reply('Forbidden', 403);
    const range = request.headers.get('Range');
    if (range && !/^bytes=(\d+-\d*|-\d+)$/.test(range)) return reply('Invalid range', 416);
    let object;
    try { object = await env.AUDIO.get(`${track}-${mode}.mp3`, range ? { range: request.headers } : undefined); }
    catch { return reply('Unable to read audio', 503); }
    if (!object) return reply('Not found', 404);
    const responseHeaders = new Headers(headers);
    responseHeaders.set('Content-Type', 'audio/mpeg');
    responseHeaders.set('Content-Disposition', 'inline');
    responseHeaders.set('Accept-Ranges', 'bytes');
    if (range && object.range) {
      const { offset, length } = object.range;
      responseHeaders.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
      responseHeaders.set('Content-Length', String(length));
    } else { responseHeaders.set('Content-Length', String(object.size)); }
    return new Response(request.method === 'HEAD' ? null : object.body, { status: range && object.range ? 206 : 200, headers: responseHeaders });
  },
};
