# Kanon Studio — Moonlit Atelier

## October 10, 2026 — Two-song listening pilot

The user requested that existing MP3s be found and integrated into the website player. Start with ビットコインがいっぱい⭐︎ and ほどけ, using the matching original recordings. Home introduces their contrasting sounds with a short Japanese headline, three plain-language tags and a native 30-second player. Each clip is an excerpt from 0:45–1:15 with short fades; do not label it a chorus, since that has not been verified. The corresponding work detail provides full playback above the cover image, and the archive marks those works as playable on-site. Retain Suno links, the featured 流星待ち, all existing works and the image-only hero.

The user prioritizes deterring casual downloads while retaining full playback. Do not publish MP3s to GitHub or static assets. Private R2 storage and a Worker issue 10-minute, IP-bound signed URLs on an explicit play action, with origin/referer checks and session rate limiting. Native controls hide download actions where supported; audio-specific context menus are suppressed. These measures are deterrence, not DRM: clients receive audio and advanced extraction/recording remains possible. Referrer/privacy restrictions or network changes may require Suno fallback.

Players are user-initiated, preload none and keyboard accessible. JavaScript is required for protected playback, but Suno links remain available without it. Pause other tracks when one starts. This pilot does not continue playback across page navigation. MP3s use 160 kbps stereo encoding and stay in private storage. If the API endpoint is absent, show Suno links instead of nonfunctional players.

## 今後の更新方針 — 2026年10月10日

ユーザーは、今後のホームページ更新でも、スクロール演出やインタラクションの技法を積極的かつ適正に取り入れることを希望している。各更新で、作品の魅力・世界観・情報の伝わり方・操作性を改善する演出を自発的に検討する。今回採用した5種類に限定せず、目的に合う他の技法も候補にする。

- 技法は具体名と目的を結びつけて選ぶ。作品を見せるにはフェードイン・スタッガー、奥行きにはパララックス、長い説明にはスクロールテリング、位置の把握にはスティッキー・スクロールスパイなどを検討する。
- テキスト中心・画像中心など、ページの内容に応じて強さと頻度を調整する。Kanon Studioの画像中心の構成、月明かりの世界観、既存の作品とリンクを尊重する。
- スクロールスナップ・ピン留め・横スクロールなども、内容と操作に適していれば採用候補にする。今回見送った技法を今後の恒久的な禁止事項にはしない。
- スマホでの操作性、表示速度、読みやすさ、キーボード操作、視差効果を減らす設定に対応する。JavaScriptや演出が無効でも作品とリンクを利用できるようにする。
- 更新後は「採用した技法」「使った場所」「採用理由」を短く説明する。検証できた範囲と未確認の範囲を正確に伝える。

## October 10, 2026 — Named motion refinement

The user requested a homepage update inspired by the animation vocabulary in https://x.com/showheyohtaki/status/2108065874511077598. Preserve the existing image-only hero, night palette, content and mobile portrait framing. Add a subtle desktop parallax (art travels up to 18px while moonlight travels in the opposite direction), one-time fade/slide reveals and 90ms staggered work cards. The Home header stays visible with a translucent navy background. Keep natural scrolling; do not force scroll snapping or pin artwork over content.

Motion is progressive enhancement. With JavaScript disabled or reduced motion enabled, all content is immediately visible. Keyboard focus reveals a pending block immediately. Mobile retains its original hero crop, uses a shorter 12px reveal and disables parallax. Scroll work is coalesced into animation frames and stops when the hero is offscreen. Other routes retain their existing appearance.

## October 2, 2026 — Local visual refinement

This revision builds on main after the September 26 redesign and the gentle moonlight/motes update. It is a local review candidate, not a deployed change.

Keep the full-width, image-only hero, hidden H1, existing mobile portrait source and centered 4:5 framing. A short gradient at the bottom joins the illustration to the navy canvas without covering the face. Existing moonlight and six slow light motes remain, with reduced-motion support.

Home uses open editorial layouts in place of enclosing feature/game cards: a larger featured cover beside compact copy, fine section rules, 64–112px desktop section spacing, and 56px mobile spacing. Retain the staggered illustration gallery and compact mobile music arrangement. A small arched creator portrait and understated service links close the page. Lavender is softened to #C4B7E6; muted text is #A8AEC4; fine rules use white at 13% opacity on the navy canvas. Existing Japanese display/body fonts remain; hierarchy comes from size, tracking and spacing.

Scope is homepage styling and night-theme header/footer details. Preserve every work, link and description; no new embeds, hero text, mood selector or features. Other routes retain their existing theme. Validate with the README quality gates and desktop/mobile browser review.

## September 26, 2026 — Homepage revision (merged)

The user's latest direction supersedes the Home composition below: use an image-only, full-width hero and remove Find your mood. The homepage now uses a dark navy palette with lavender accents. Other routes retain their existing theme.

Home order: full-width hero with a dedicated mobile image; Music with the featured 流星待ち and three additional songs selected by publication date; three curated illustrations; the existing BITCOIN BEAT LIVE game; a compact creator introduction and verified social links. Keep the page's H1 available to screen readers without visible hero copy. Place the one existing production journal link alongside its related featured song. The Journal archive remains reachable from navigation.

Mobile illustrations preserve faces with portrait crops. All content is sourced from existing collections. Preview checked at 1440px and 390px, including image loading, overflow and mobile navigation. This remains a draft pending publication approval.

Approved 2026-09-06. A small, sophisticated, welcoming atelier for music, visuals and notes.

## Color and type
Milk canvas #FAF8F5; ivory surface #FFFEFC; lavender #ECE7F3; blue surface #E9EFF5. Plum ink #363144, muted text #6E647A, primary #705A89, hover #5F4C78 and secondary blue #496A86. Muted and primary colors are slightly deeper than the initial concept to preserve readable contrast on tinted surfaces. The legacy coral token aliases the primary color for existing components; no coral is used.

Zen Maru Gothic 500 for subtly rounded headings; Noto Sans JP 400/500/600 for neutral, readable copy and controls. Hero type is 32–46px desktop and 28–34px mobile; ordinary descriptions are 14–16px. Compact 4–8px corners and fine rules replace large enclosing cards. Only small decorative moon, star and music motifs; no continuous animation or background audio. Platform marks inherit currentColor and accompany visible service names.

## Composition
Header: moon seal and compact two-line brand; Works / Journal / About navigation, native mobile disclosure with visible keyboard focus.
Home: split illustrated hero with original watercolor Kanon art and a useful Works CTA, featured 流星待ち with verified Suno destination, three real music mood links, three curated visual works, published Journal entries and a short creator introduction with verified services. Art receives more width than the copy, with a fine lavender edge and one gently curved corner. Home sections are spaced 52px desktop / 36px mobile. Hero stacks on narrow screens. At 640px and below, a dedicated 1122×1402 portrait illustration replaces the 1536×1024 landscape image, displayed in a compact 3:2 crop centered at 54% vertically.
Archive: compact type-led introduction, category and music style pills, clean gallery images. Details retain complete artwork, metadata, notes and their original external destinations. Journal uses fine rules and quiet reading surfaces. About retains the approved portrait and actual creator information.

## Content and behavior
All existing works, journal entries, slugs, service destinations, data selectors and category/style query behavior remain unchanged. No invented songs, video releases, statistics or biography. The hero's original illustrative asset is independent of work covers. Featured music URL is read directly from the content collection.

## Accessibility and verification
Semantic heading order, alt text, intrinsic image dimensions, keyboard focus, minimum 44px controls, native menu and reduced-motion support. No layout shifts on hover. Validate with Astro check, existing correctness and accessibility tests, and desktop/mobile browser review. No public deployment is part of this redesign.


## Approved refinement — September 6, 2026
The user approved a subtler rounded heading voice with neutral readable Gothic body and menu text. Zen Maru Gothic 500 (700 available for intentional emphasis) replaces the serif display face; Noto Sans JP 400/500/600 remains the body and navigation font. Headlines use the medium weight, not a heavy or hand-drawn treatment. Hero type is 32–46px desktop and 28–34px mobile; ordinary descriptions are 14–16px.

This refinement supersedes the earlier large arched frame and uniform card composition. Desktop hero gives more width to the art and uses a compact landscape crop. The dedicated mobile portrait is displayed in a 3:2 crop at 54% vertical positioning to retain Kanon's face without stretching the page. The gallery follows natural reading order with a large first work and two smaller, gently staggered works on desktop; mobile uses one wide image followed by two smaller portraits. Mood links, Journal and creator introduction use fine rules and generous text flow instead of repeating enclosing cards. Corners are reduced to 4–8px except small circular motifs and portraits. Small color accents retain the moonlit identity; interactions and all content remain unchanged.
