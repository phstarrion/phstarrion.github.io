# Kanon Studio — Moonlit Atelier

## October 10, 2026 — X connection

Connect the existing @phstarrion X account with the portfolio. Keep the image-led hero and native mobile navigation. Add a named X link to the global menu, clarify the existing service-hub X label, and place share/follow actions after work details and the listening archive. Each listening track shares its work URL or its own archive anchor. Share links open an X composer with the title, canonical HTTPS page URL and author handle; nothing is posted automatically. The listening archive uses the existing atelier artwork for its social preview. Do not add social feed embeds, tracking scripts or automatic posting.

## October 10, 2026 — Two-song listening pilot

The user chose on-site 30-second previews plus full playback on Suno after Cloudflare login proved inconvenient. Feature ビットコインがいっぱい⭐︎ and ほどけ with contrasting sound descriptions and three tags. The clips are excerpts from 0:45–1:15 with fades; do not call them choruses without listening verification. Both home and work details use the preview, with a clear full-track Suno link. Preserve the image-led hero and existing featured work.

Publish only the two 160 kbps stereo preview MP3s. Never publish full recordings to the repository or static build. Native controls use preload none and no autoplay, and work without JavaScript. JavaScript pauses other players and reports errors with a Suno fallback. Hide download buttons where supported and suppress audio context menus; this deters casual saving but does not prevent preview extraction. No cross-page playback persistence. The deferred private-audio approach is saved on feat/protected-audio; no Cloudflare setup is needed for this release.

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


## Listening archive

`/music/` automatically lists audio-enabled works plus `src/data/additional-previews.ts`. Sort by verified creation date, falling back to clearly labeled work publication date; entirely undated songs go last. Never use file upload timestamps as creation dates. Only 30-second derivatives belong in public/audio; original full MP3s stay private. The current additional stem-adjusted song has neither a verified creation date nor a verified Suno URL. The abstract record cover is decorative and is not presented as original artwork.

## 作品のいいねと流入計測

LikeButton と src/lib/engagement.ts が匿名リアクションを保存する。作品IDを共有し、カード・詳細・Musicで同じ作品を重複加算しない。ブラウザのIDをサーバー側でHMAC変換し、複合主キーで連打を防ぐ。数は公開APIに含めない。

管理画面: https://kanon-engagement.kanon-kurose.chatgpt.site/admin/ （所有者のChatGPT認証のみ）。新しい作品を追加するときは保存側 app/lib/catalog.ts の許可作品IDも更新する。

X固定投稿の返信用: https://phstarrion.github.io/?utm_source=x&utm_campaign=pinned_reply
ほかのSNSはutm_sourceをinstagram/threads/youtube/tiktok/noteに変更。流入元が取得できない訪問は直接・不明。集計は導入後からで、履歴の復元はしない。


All music work pages use the night palette and shared MusicPreview block. Available derivatives play for 30 seconds; missing derivatives show 音源は準備中 with no broken audio element. Named alternate editions may match an existing work through detailUrl and must disclose the edition. The music catalog includes pending works, preserving their existing detail URLs and notes.

ホームから Music へは全曲一覧と曲ごとのアンカーで接続し、戻り先はトップの音楽見出し。アンカー先は tabindex=-1 で自然な Tab 順序を維持しつつ移動時のフォーカスを受けられる構成にする。繰り返し表示する曲紹介・Sunoリンクは曲名を読み上げ用の名前に含める。音声は自動再生せず、ネイティブ操作・フォーカス表示・本文スキップ・動きを減らす設定を維持する。

全ページ点検では内部リンク・アンカー・画像属性・単一のh1・重複ID・全ページのDOMアクセシビリティを確認する。フッターにもMusicを置き、作品の絞り込みは件数だけをライブ通知する（一覧全体を読み上げ直さない）。該当0件はAllへの案内を表示。暗色テーマでは旧coral別名も明示的に明るいlavenderへ設定する。公開日は制作日と区別して明記する。

2026-10-10: 音楽の「この場所で聴く」「FEATURED」の二重の区分を廃止し、おすすめ3曲を同じカード・共通MusicPreviewで表示する。制作ノートは聴く機能と区別して「歌詞の物語を読む」導線にする。Journal一覧・記事もnightに統一し、読む目的を日本語で明記する。従来のFEATURED別レイアウトよりこの指示を優先する。
