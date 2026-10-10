# W3C accessibility review — 2026-10-10

Baseline: WCAG 2.2 levels A and AA. This is an engineering review, not a conformance certification.

Scope: all 45 generated pages, including Home, Music, Works and 36 work details, Journal and its article, About, Games, Privacy and 404. Linked Suno, X and the external game are outside this checkout.

## Corrected

- 2.1.1 / 2.4.3 / 4.1.2: desktop navigation now uses genuinely open native details rather than painting a closed disclosure through CSS. JavaScript closes it initially on mobile. Without JavaScript every route stays visible. Escape closes the mobile menu and returns focus to its summary; resizing retains a focused route.
- 2.4.1: the skip destination is programmatically focusable. Its hidden positioning no longer depends on a transform, so reduced-motion settings do not accidentally expose it continuously. Markdown contents links likewise land on focusable headings.
- 2.4.11: removed the home sticky header and put mobile menu contents into normal document flow, so navigation does not cover the focused content below it.
- 1.3.1: the nested Follow Kanon section uses h3 beneath the About h2.
- 1.4.1 / 1.4.11: filters have an underlined selected label as well as aria-pressed; meaningful control edges use higher-contrast tokens separately from decorative separators.
- 1.4.10: the header can wrap; long text can break within its reading column. Actual 320 CSS pixel and 400% zoom layouts still need browser review.
- 2.2.2: decorative moonlight and particle animations finish after four seconds instead of looping indefinitely. Reduced-motion settings remain respected.
- Progressive enhancement: filter controls stay hidden until their script initializes; all works are readable without JavaScript.

## Verified

All generated HTML was checked for DOM accessibility with axe, single h1, landmark structure, image alternatives and dimensions, duplicate IDs, internal links and anchor destinations. Native audio controls, no autoplay, single-player behavior, play/pause labels, loading/error notices, filter result notices and immediate like feedback retain existing functional coverage. Navigation has functional tests for mobile Escape, viewport changes and repeated initialization.

Theme token calculations cover normal text (at least 4.5:1) on canvas, surface, lavender and blue surfaces; meaningful control borders (at least 3:1) on canvas, surface and lavender. This does not measure rendered CSS, imagery, native browser controls or every transient state. Existing authored controls retain heights of at least 44 CSS pixels; the primary preview button is 56 pixels. Inline links and user-agent audio controls need separate target-size assessment.

## Remaining verification and content work

- Actual keyboard sequences, VoiceOver/NVDA output, 320 CSS pixel reflow, 400% zoom, custom text spacing, forced colors and rendered contrast need browser/assistive-technology checks. This environment did not run those checks.
- 1.2.1: each of the nine prerecorded audio previews needs a verified text alternative containing the audible lyrics and relevant musical/non-speech information. Current headlines and song introductions are not complete transcripts. Do not invent missing lyrics or label the site fully A/AA conformant until these alternatives are provided and checked against the exact 30-second clips.

## Rules for future changes

Keep semantic headings, native buttons/links, visible focus, visible-label-compatible accessible names, no autoplay and clear status/error feedback. Link targets must exist and accept focus where needed. Preserve 44px authored controls and test narrower layouts. Keep decorative separators separate from contrast-critical control edges. Give automatically moving content a stop mechanism or finish within five seconds. New audio requires verified text alternatives; new images require contextual alt text. Run build, Astro check and all tests after changes; DOM tests alone never establish full WCAG compliance.

References: https://www.w3.org/TR/WCAG22/ ; https://www.w3.org/WAI/WCAG22/quickref/ ; https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ ; https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html ; https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html
