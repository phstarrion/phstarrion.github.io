# Private music delivery

Current status: implementation prepared and tested locally; not provisioned or deployed. The public GitHub Pages site stays on its current host. No audio file belongs in this repository or its history.

Cloudflare R2 must remain private: disable `r2.dev` public access and do not attach a public bucket domain. The Worker reads the bucket through its `AUDIO` binding. It issues a 10-minute HMAC-signed playback URL bound to the visitor's Cloudflare-observed IP. Browser requests must refer from `https://phstarrion.github.io`. POST session requests are limited to 20/minute per IP per Cloudflare location. Range requests support native seeking. Responses are `no-store` and use `Content-Disposition: inline`.

This is public listening with download deterrence, NOT DRM or authentication. A technical user can spoof Origin/Referer, acquire sessions and extract audio while valid, or record playback. IP changes, VPN/privacy tools, blocked referrers or expiry after a long pause may interrupt playback; the play button retries with a new session. Shared IPs may hit the rate limit. Browser `nodownload` support varies.

## Setup

1. Connect the owner's Cloudflare account; install/run the official Wrangler CLI in this directory. R2 activation may require billing setup; the owner must complete that step. Do not paste API keys in chat or commit them.
2. Create the private `kanon-audio-private` R2 bucket. Upload these four encoded files privately under exactly these keys: `bitcoin-ga-ippai-full.mp3`, `bitcoin-ga-ippai-preview.mp3`, `hodoke-full.mp3`, `hodoke-preview.mp3`. Use `wrangler r2 object put kanon-audio-private/KEY --file /absolute/local/path/KEY --remote`.
3. Set `SIGNING_SECRET` with `wrangler secret put SIGNING_SECRET` using a cryptographically random secret of at least 32 characters. Keep it in Cloudflare secret storage only. Deployment fails closed without it.
4. Check `wrangler.jsonc` bindings and deploy using `wrangler deploy`. This standalone service uses no third-party runtime libraries.
5. Set the GitHub repository Actions variable `PUBLIC_AUDIO_API_URL` to the Worker's HTTPS origin (no trailing slash). Build and deploy the site. This endpoint is public configuration, not a secret.
6. Verify real browser preview/full playback on desktop and mobile, seeking with HTTP 206, no autoplay, one active track, fresh-session retry, keyboard use, and Suno fallback. Verify the public build/repository has no MP3s and unauthenticated/expired/wrong-IP/wrong-referrer stream requests fail. Disable public bucket access before uploading.

If deploying locally for development, use `.dev.vars` for the signing secret, which is gitignored. Production requires Cloudflare's trusted `CF-Connecting-IP` header and the rate-limiter binding; a missing binding fails closed. Do not set client-provided IP fallbacks.
