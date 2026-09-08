import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';
import { describe, expect, it } from 'vitest';

// Vite rewrites dynamic new URL() asset references, so derive a real file path first.
const testDirectory = dirname(fileURLToPath(import.meta.url));
const readMarkup = (path: string) =>
  readFile(join(testDirectory, '..', 'dist', path), 'utf8');

const readMarkupOrEmpty = (path: string) => readMarkup(path).catch(() => '');

const parseBody = (html: string) => {
  const page = document.implementation.createHTMLDocument();
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? html;
  page.body.innerHTML = body;
  return page;
};

const readPage = async (path: string) => {
  const html = await readMarkup(path);
  const stylesheetPaths = [...html.matchAll(/<link rel="stylesheet" href="([^"?]+)(?:\?[^"?]*)?">/g)]
    .map(([, href]) => href)
    .filter((href) => href.startsWith('/_astro/'));
  const stylesheets = await Promise.all(
    stylesheetPaths.map((href) => readFile(join(testDirectory, '..', 'dist', href), 'utf8')),
  );

  return [html, ...stylesheets].join('\n');
};

describe('generated pages', () => {
  it.each([
    ['Home', 'index.html', 'https://phstarrion.github.io/', 'summary_large_image'],
    ['Works', 'works/index.html', 'https://phstarrion.github.io/works/', 'summary'],
    [
      'work detail',
      'works/sugar-crash-protocol/index.html',
      'https://phstarrion.github.io/works/sugar-crash-protocol/',
      'summary_large_image',
    ],
    ['Journal', 'journal/index.html', 'https://phstarrion.github.io/journal/', 'summary'],
    [
      'journal article',
      'journal/ryuseimachi/index.html',
      'https://phstarrion.github.io/journal/ryuseimachi/',
      'summary_large_image',
    ],
    ['About', 'about/index.html', 'https://phstarrion.github.io/about/', 'summary'],
    ['404', '404.html', 'https://phstarrion.github.io/404/', 'summary'],
  ])('publishes complete metadata and one page heading for %s', async (_, path, canonicalUrl, twitterCard) => {
    const html = await readMarkupOrEmpty(path);
    expect(html, `${path} must be generated`).not.toBe('');

    const page = new Window({ url: canonicalUrl }).document;
    page.write(html);

    const title = page.querySelector('title')?.textContent?.trim() ?? '';
    const description = page.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '';

    expect(title).not.toBe('');
    expect(description).not.toBe('');
    expect(page.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonicalUrl);
    expect(page.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(title);
    expect(page.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(description);
    expect(page.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(twitterCard);
    expect(page.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(title);
    expect(page.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe(description);
    expect(page.querySelectorAll('h1')).toHaveLength(1);
  });

  it('keeps every generated page free of placeholder and inactive-service patterns', async () => {
    const distDirectory = join(testDirectory, '..', 'dist');
    const htmlPaths = (await readdir(distDirectory, { recursive: true }))
      .filter((path) => path.endsWith('.html'));
    const builtHtml = (await Promise.all(
      htmlPaths.map(async (path) => `${path}\n${await readFile(join(distDirectory, path), 'utf8')}`),
    )).join('\n');

    expect(htmlPaths.length).toBeGreaterThan(0);
    expect(builtHtml).not.toMatch(/@yourhandle/i);
    expect(builtHtml).not.toMatch(/example\.com/i);
    expect(builtHtml).not.toMatch(/(?:youtube\.com|youtu\.be)/i);
    expect(builtHtml).not.toMatch(/glassmorphism/i);
    expect(builtHtml).not.toMatch(/href=["'][^"']*tiktok\.com/i);
  });

  it('uses the creator portrait only in the Home introduction and About profile', async () => {
    const distDirectory = join(testDirectory, '..', 'dist');
    const htmlPaths = (await readdir(distDirectory, { recursive: true }))
      .filter((path) => path.endsWith('.html'));
    const pagesWithPortrait = (
      await Promise.all(
        htmlPaths.map(async (path) => ({
          path,
          html: await readFile(join(distDirectory, path), 'utf8'),
        })),
      )
    )
      .filter(({ html }) => html.includes('/images/kanon-avatar.jpg'))
      .map(({ path }) => path);

    expect(pagesWithPortrait.sort()).toEqual(['about/index.html', 'index.html']);
  });

  it('builds a Japanese home page with one main landmark', async () => {
    const html = await readPage('index.html');
    expect(html).toContain('<html lang="ja">');
    expect(html.match(/<main[\s>]/g)).toHaveLength(1);
    expect(html).toContain('Kanon Studio');
  });

  it('loads the specified Japanese display and body fonts', async () => {
    const html = await readPage('index.html');
    expect(html).toContain('fonts.googleapis.com/css2?family=Noto+Sans+JP');
    expect(html).toContain('family=Zen+Maru+Gothic:wght@500;700');
  });

  it('includes safe global navigation and verified service links', async () => {
    const html = await readPage('index.html');
    expect(html).toContain('href="/works/"');
    expect(html).toContain('href="/journal/"');
    expect(html).toContain('href="/about/"');
    expect(html).toContain('href="https://x.com/phstarrion"');
    expect(html).toContain('href="https://suno.com/@phstarrion"');
    expect(html).toContain('rel="me noopener noreferrer"');
    expect(html).not.toContain('@yourhandle');
    expect(html).toContain('href="#main-content"');
  });

  it('starts the mobile menu closed and keeps desktop navigation independent of open state', async () => {
    const html = await readMarkup('index.html');
    const page = parseBody(html);
    const menu = page.querySelector('details.site-header__menu');
    const generated = await readPage('index.html');

    expect(menu?.hasAttribute('open')).toBe(false);
    expect(generated).toMatch(
      /@media\(min-width:768px\)[\s\S]*\.site-header__menu(?:\[data-astro-cid-[^\]]+\])?:not\(\[open\]\)>nav(?:\[data-astro-cid-[^\]]+\])?\{display:block\}/,
    );
    // Without this the closed <details> keeps content-visibility on its content, collapsing the
    // desktop navigation to zero width and pushing every link off the right edge of the viewport.
    expect(generated).toMatch(
      /@media\(min-width:768px\)[\s\S]*\.site-header__menu(?:\[data-astro-cid-[^\]]+\])?::details-content\{content-visibility:visible;display:contents\}/,
    );
  });

  it.each([
    ['Home', 'index.html', '/'],
    ['Works', 'works/index.html', '/works/'],
    ['work detail', 'works/sugar-crash-protocol/index.html', '/works/'],
    ['Journal', 'journal/index.html', '/journal/'],
    ['About', 'about/index.html', '/about/'],
  ])('marks the matching navigation route current on %s', async (_, path, currentHref) => {
    const page = parseBody(await readMarkup(path));
    const currentLinks = [...page.querySelectorAll<HTMLAnchorElement>('.site-header a[aria-current="page"]')];

    expect(currentLinks).toHaveLength(1);
    expect(currentLinks[0]?.getAttribute('href')).toBe(currentHref);
  });

  it('uses the restrained primary current-page indicator', async () => {
    const generated = await readPage('works/index.html');

    expect(generated).toMatch(
      /\[aria-current=page\]:after\{[^}]*background:var\(--color-coral\)/,
    );
  });

  it.each([
    ['Home', 'index.html', 'website'],
    ['Works', 'works/index.html', 'website'],
    ['Journal', 'journal/index.html', 'website'],
    ['About', 'about/index.html', 'website'],
    ['work detail', 'works/ryuseimachi/index.html', 'article'],
    ['journal article', 'journal/ryuseimachi/index.html', 'article'],
  ])('attributes %s to the verified X account with the right Open Graph type', async (_, path, ogType) => {
    const html = await readMarkup(path);
    const page = new Window({ url: 'https://phstarrion.github.io/' }).document;
    page.write(html);
    const meta = (name: string) =>
      page.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content');

    expect(meta('twitter:site')).toBe('@phstarrion');
    expect(meta('twitter:creator')).toBe('@phstarrion');
    expect(meta('og:type')).toBe(ogType);

    if (ogType === 'article') {
      // Shared on X, an article should carry its publication date and a described image.
      expect(meta('article:published_time')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(meta('og:image')).toMatch(/^https:\/\/phstarrion\.github\.io\/images\//);
      expect((meta('og:image:alt') ?? '').length).toBeGreaterThan(12);
      expect(meta('twitter:card')).toBe('summary_large_image');
    } else {
      expect(meta('article:published_time')).toBeUndefined();
    }
  });

  it('classifies every song into one of the three listening modes', async () => {
    const page = parseBody(await readMarkup('works/index.html'));
    const cards = [...page.querySelectorAll<HTMLElement>('.work-grid > li[data-category]')];
    const music = cards.filter((card) => card.dataset.category === 'music');
    const other = cards.filter((card) => card.dataset.category !== 'music');

    expect(music.length).toBeGreaterThan(0);
    expect(music.every((card) => ['kawaii', 'dark', 'pop'].includes(card.dataset.style ?? ''))).toBe(
      true,
    );
    // A style outside music would leave a filter combination that hides everything.
    expect(other.every((card) => card.dataset.style === undefined)).toBe(true);
  });

  it('routes a song to the rest of its listening mode', async () => {
    const page = parseBody(await readMarkup('works/sugar-crash-protocol/index.html'));
    const link = page.querySelector('[data-work-style-link]');

    expect(link?.textContent?.trim()).toBe('Kawaii');
    // A style implies music, so the shared address stays one parameter long.
    expect(link?.getAttribute('href')).toBe('/works/?style=kawaii');
  });

  it('shows the style row only for music and honours a shared style URL', async () => {
    const html = await readMarkup('works/index.html');
    const browser = new Window({ url: 'https://example.com/works/?style=dark' });
    browser.document.write(html);
    browser.eval(browser.document.querySelector('script[data-work-filters]')?.textContent ?? '');

    const styleRow = browser.document.querySelector('[data-work-style-controls]');
    const shown = [...browser.document.querySelectorAll('[data-category]')]
      .filter((card) => !card.hasAttribute('hidden'))
      .map((card) => card.getAttribute('data-style'));

    expect(styleRow?.hasAttribute('hidden')).toBe(false);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.every((style) => style === 'dark')).toBe(true);

    // happy-dom elements are not the global DOM types, so reach the click through unknown.
    const visualButton = browser.document.querySelector('[data-work-filter="visual"]');
    (visualButton as unknown as { click(): void } | null)?.click();

    expect(styleRow?.hasAttribute('hidden')).toBe(true);
    expect(browser.location.search).toBe('?category=visual');
  });

  it('sizes the editorial media panel from its aspect ratio alone', async () => {
    // A fixed min-height combined with aspect-ratio derives a minimum WIDTH
    // (280px * 16 / 9 = 498px), which overflowed the viewport on small screens.
    const generated = await readPage('works/sugar-crash-protocol/index.html');
    const rule = generated.match(
      /\.work-detail__media--editorial(?:\[data-astro-cid-[^\]]+\])?\{([^}]*)\}/,
    );

    expect(rule?.[1]).toBeDefined();
    expect(rule?.[1]).toContain('aspect-ratio');
    expect(rule?.[1]).not.toContain('min-height');
  });

  it.each([
    ['Home', 'index.html'],
    ['Works', 'works/index.html'],
    ['work detail', 'works/sugar-crash-protocol/index.html'],
    ['Journal', 'journal/index.html'],
    ['About', 'about/index.html'],
  ])('links each verified service at most once on %s', async (_, path) => {
    const page = parseBody(await readMarkup(path));

    for (const service of ['x', 'suno']) {
      const links = [...page.querySelectorAll(`a[data-service="${service}"]`)];

      expect(links.length, `${path} must not repeat the ${service} link`).toBeLessThanOrEqual(1);

      // DESIGN.md allows platform marks only alongside a visible name, and the marks must inherit
      // the link colour rather than introduce brand colours.
      for (const link of links) {
        const mark = link.querySelector('svg');

        expect(link.querySelector('.service-hub__name')?.textContent?.trim()).toBeTruthy();
        expect(mark?.getAttribute('aria-hidden')).toBe('true');
        expect(mark?.innerHTML).not.toMatch(/gradient|#[0-9a-f]{3,6}|rgb\(/i);
      }
    }
  });

  it('presents the approved atelier hero, featured track and a curated visual gallery', async () => {
    const page = parseBody(await readMarkup('index.html'));
    expect(page.querySelector('h1')?.textContent).toBe('音と、夢の、つづき。');
    expect(page.querySelector('.hero a[href="/works/"]')).not.toBeNull();
    const hero = page.querySelector<HTMLImageElement>('.hero__art img');
    expect(hero?.getAttribute('src')).toBe('/images/atelier-moonlight.png');
    expect(hero?.getAttribute('fetchpriority')).toBe('high');
    expect(hero?.alt.length).toBeGreaterThan(12);
    expect([hero?.width, hero?.height]).toEqual([1536, 1024]);
    const mobileArt = page.querySelector('.hero__art source');
    expect(mobileArt?.getAttribute('media')).toBe('(max-width: 640px)');
    expect(mobileArt?.getAttribute('srcset')).toBe('/images/atelier-moonlight-mobile.png');
    expect(mobileArt?.getAttribute('width')).toBe('1122');
    expect(mobileArt?.getAttribute('height')).toBe('1402');
    expect(page.querySelector('[data-featured-listen]')?.getAttribute('href')).toBe(
      'https://suno.com/song/4ff1776f-a22d-4682-9edf-fd054197aeee',
    );
    expect(page.querySelectorAll('.selected-works [data-work-card]')).toHaveLength(3);
    expect(page.querySelectorAll('.selected-works .work-card--visual')).toHaveLength(3);
    expect(page.querySelectorAll('#home-service-hub-title')).toHaveLength(1);
    expect(page.body.textContent).not.toContain('Tokyo');
  });

  it.each(['kawaii', 'dark', 'pop'])('opens the %s Home mood link into matching music', async (style) => {
    const home = parseBody(await readMarkup('index.html'));
    const href = home.querySelector(`[data-mood-link="${style}"]`)?.getAttribute('href');
    expect(href).toBe(`/works/?style=${style}`);
    const browser = new Window({ url: `https://example.com${href}` });
    browser.document.write(await readMarkup('works/index.html'));
    browser.eval(browser.document.querySelector('script[data-work-filters]')?.textContent ?? '');
    const visible = [...browser.document.querySelectorAll('[data-category]')]
      .filter((card) => !card.hasAttribute('hidden'));
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((card) => card.getAttribute('data-category') === 'music'
      && card.getAttribute('data-style') === style)).toBe(true);
    expect(browser.document.querySelector(`[data-work-style="${style}"]`)
      ?.getAttribute('aria-pressed')).toBe('true');
  });

  it('renders visual work images with stable dimensions and music as editorial panels', async () => {
    const html = await readMarkup('index.html');
    const page = parseBody(html);
    const workCards = [...page.querySelectorAll<HTMLElement>('[data-work-card]')];

    expect(workCards.length).toBeGreaterThan(0);
    for (const card of workCards) {
      const image = card.querySelector('img');
      if (card.classList.contains('work-card--visual')) {
        expect(image?.getAttribute('width')).toMatch(/^\d+$/);
        expect(image?.getAttribute('height')).toMatch(/^\d+$/);
        expect(image?.getAttribute('loading')).toBe('lazy');
      } else if (card.classList.contains('work-card--music')) {
        // Music ships either with real artwork or with the editorial title plate, never with a
        // half-configured image.
        if (image) {
          expect(image.getAttribute('width')).toMatch(/^\d+$/);
          expect(image.getAttribute('height')).toMatch(/^\d+$/);
          expect(image.getAttribute('loading')).toBe('lazy');
          expect(image.getAttribute('alt')?.length ?? 0).toBeGreaterThan(12);
        } else {
          expect(card.querySelector('[data-work-media="editorial"]')).not.toBeNull();
        }
      }
    }

    const starlitMaid = page.querySelector<HTMLImageElement>(
      'img[src="/images/works/visual-starlit-maid.jpeg"]',
    );
    expect([starlitMaid?.width, starlitMaid?.height]).toEqual([1122, 1402]);
    expect(page.querySelector('.atelier-about img[src="/images/kanon-avatar.jpg"]')).not.toBeNull();
  });

  it('uses the normative display line-height for the Home hero', async () => {
    const generated = await readPage('index.html');

    expect(generated).toMatch(
      /h1\[[^\]]+\]\{[^}]*line-height:var\(--type-display-line-height\)/,
    );
  });

  it('removes transforms when reduced motion is requested', async () => {
    const html = await readPage('index.html');
    expect(html).toContain('@media(prefers-reduced-motion:reduce)');
    expect(html).toContain('transform:none!important');
  });

  it('builds the complete works archive with accessible category filters', async () => {
    const html = await readMarkup('works/index.html');
    const page = parseBody(html);
    const filters = [...page.querySelectorAll<HTMLButtonElement>('[data-work-filter]')];
    const cards = [...page.querySelectorAll<HTMLElement>('[data-work-card]')];
    const filterableItems = [...page.querySelectorAll<HTMLElement>('[data-category]')];

    expect(filters.map((filter) => filter.textContent?.trim())).toEqual([
      'All',
      'Music',
      'Visual',
      'Video',
    ]);
    expect(filters.map((filter) => filter.getAttribute('aria-pressed'))).toEqual([
      'true',
      'false',
      'false',
      'false',
    ]);
    // Derived from the content directory so publishing a work does not fail the suite.
    const publishedWorks = (
      await readdir(join(testDirectory, '..', 'src', 'content', 'works'))
    ).filter((filename) => filename.endsWith('.md')).length;

    expect(publishedWorks).toBeGreaterThan(0);
    expect(cards).toHaveLength(publishedWorks);
    expect(filterableItems).toHaveLength(publishedWorks);
    expect(filterableItems.every((item) => item.matches('.work-grid > li'))).toBe(true);
    expect(filterableItems.every((item) => !item.hidden)).toBe(true);
  });

  it('enhances the archive filters from shareable category query state', async () => {
    const html = await readMarkup('works/index.html');
    const browser = new Window({ url: 'https://example.com/works/?category=music' });
    browser.document.write(html);
    const script = browser.document.querySelector('script[data-work-filters]');

    expect(script).not.toBeNull();
    browser.eval(script?.textContent ?? '');

    expect(browser.document.querySelector('[data-work-filter="music"]')?.getAttribute('aria-pressed'))
      .toBe('true');
    expect(browser.document.querySelector('[data-work-filter="all"]')?.getAttribute('aria-pressed'))
      .toBe('false');
    expect([...browser.document.querySelectorAll('[data-category="music"]')]
      .every((card) => !card.hasAttribute('hidden'))).toBe(true);
    expect([...browser.document.querySelectorAll('[data-category="visual"]')]
      .every((card) => card.hasAttribute('hidden'))).toBe(true);

    browser.document.querySelector('[data-work-filter="visual"]')
      ?.dispatchEvent(new browser.Event('click', { bubbles: true }));
    expect(browser.location.search).toBe('?category=visual');
    expect(browser.document.querySelector('[data-work-filter="visual"]')?.getAttribute('aria-pressed'))
      .toBe('true');

    browser.document.querySelector('[data-work-filter="all"]')
      ?.dispatchEvent(new browser.Event('click', { bubbles: true }));
    expect(browser.location.search).toBe('');
    expect([...browser.document.querySelectorAll('[data-category]')]
      .every((card) => !card.hasAttribute('hidden'))).toBe(true);
  });

  it('falls back to the all filter for invalid category query values', async () => {
    const html = await readMarkup('works/index.html');
    const browser = new Window({ url: 'https://example.com/works/?category=unknown' });
    browser.document.write(html);
    const script = browser.document.querySelector('script[data-work-filters]');

    browser.eval(script?.textContent ?? '');

    expect(browser.document.querySelector('[data-work-filter="all"]')?.getAttribute('aria-pressed'))
      .toBe('true');
    expect([...browser.document.querySelectorAll('[data-category]')]
      .every((card) => !card.hasAttribute('hidden'))).toBe(true);
  });

  it('builds a complete music work detail with one clearly named destination', async () => {
    const html = await readMarkup('works/sugar-crash-protocol/index.html');
    const page = parseBody(html);
    const externalLinks = [...page.querySelectorAll<HTMLAnchorElement>('[data-work-external]')];

    expect(page.querySelector('h1')?.textContent).toContain('Sugar Crash Protocol');
    expect(page.body.textContent).toContain(
      '甘さと混沌の対比。キュートなボイスとアグレッシブなビート',
    );
    expect(page.body.textContent).toContain('Music');
    expect(page.querySelector('time')?.getAttribute('datetime')).toBe('2025-12-30');
    expect(externalLinks).toHaveLength(1);
    expect(externalLinks[0]?.textContent?.trim()).toBe('Sunoで聴く');
    expect(externalLinks[0]?.href).toBe(
      'https://suno.com/song/2a8bafd4-651e-4c13-bf40-181e197d9c7b',
    );
    const cover = page.querySelector<HTMLImageElement>('.work-detail__media img');

    expect(cover?.getAttribute('src')).toBe('/images/works/music-sugar-crash-protocol.jpeg');
    expect(cover?.getAttribute('width')).toMatch(/^\d+$/);
    expect(cover?.getAttribute('height')).toMatch(/^\d+$/);
    expect(cover?.alt.length).toBeGreaterThan(12);
    expect(page.querySelector('[data-work-media="editorial"]')).toBeNull();
    expect(page.querySelector('.work-detail__metadata')?.textContent).toContain(
      'Drum and Bass / Electronic',
    );
    expect(html).toContain('/images/works/music-sugar-crash-protocol.jpeg');
  });

  it('uses h3 titles for related works while preserving Home and archive hierarchy', async () => {
    const detail = parseBody(await readMarkup('works/sugar-crash-protocol/index.html'));
    const home = parseBody(await readMarkup('index.html'));
    const archive = parseBody(await readMarkup('works/index.html'));

    expect(detail.querySelectorAll('.related-works [data-work-card] h3').length).toBeGreaterThan(0);
    expect(detail.querySelectorAll('.related-works [data-work-card] h2')).toHaveLength(0);
    expect(home.querySelectorAll('.selected-works [data-work-card] h3').length).toBeGreaterThan(0);
    expect(home.querySelectorAll('.selected-works [data-work-card] h2')).toHaveLength(0);
    expect(archive.querySelectorAll('[data-work-card] h2').length).toBeGreaterThan(0);
    expect(archive.querySelectorAll('[data-work-card] h3')).toHaveLength(0);
  });

  it('keeps visual detail pages free of external calls to action', async () => {
    const html = await readMarkup('works/visual-starlit-maid/index.html');
    const page = parseBody(html);

    expect(page.querySelector('h1')?.textContent).toContain('星降る夜のメイド');
    expect(page.querySelectorAll('[data-work-external]')).toHaveLength(0);
  });

  it('renders distinct Markdown production notes for music and visual details', async () => {
    const cases = [
      {
        path: 'works/sugar-crash-protocol/index.html',
        summary: '甘さと混沌の対比。キュートなボイスとアグレッシブなビート',
        note: 'ジャンルはDrum and Bass / Electronic',
      },
      {
        path: 'works/visual-starlit-maid/index.html',
        summary: '星空と工場夜景を背景に、白い髪の猫耳メイドが空を見上げるビジュアル作品。',
        note: '流星と遠景の工場灯',
      },
    ];

    for (const { path, summary, note } of cases) {
      const html = await readMarkup(path);
      const page = parseBody(html);
      const productionNotes = page.querySelector('[aria-labelledby="production-notes-title"]');

      expect(productionNotes?.textContent).toContain(note);
      expect(productionNotes?.textContent).not.toContain(summary);
    }
  });

  it('lists published journal entries instead of the empty state', async () => {
    const page = parseBody(await readMarkup('journal/index.html'));
    const rows = [...page.querySelectorAll('.journal-row')];

    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(rows.length).toBeGreaterThan(0);
    expect(page.body.textContent).not.toContain('制作ノートは準備中です。');

    for (const row of rows) {
      expect(row.querySelector('time')?.getAttribute('datetime')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.querySelector('a')?.getAttribute('href')).toMatch(/^\/journal\/[^/]+\/$/);
    }
  });

  it('builds a readable journal article with its lyric quotations intact', async () => {
    const page = parseBody(await readMarkup('journal/ryuseimachi/index.html'));
    const article = page.querySelector('.article__prose');

    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(page.querySelector('h1')?.textContent).toContain('流星待ち');
    expect(article?.querySelectorAll('h2').length).toBeGreaterThanOrEqual(5);
    expect(article?.querySelectorAll('blockquote').length).toBeGreaterThanOrEqual(10);
    expect(article?.textContent).toContain('まだ君を待ってる');
    expect(article?.textContent).toContain('もう　流星を待たない');
    expect(page.querySelector('a[href="/journal/"]')).not.toBeNull();
  });

  it('opens the journal article with a magazine masthead, photo and lead', async () => {
    const page = parseBody(await readMarkup('journal/ryuseimachi/index.html'));
    const photo = page.querySelector<HTMLImageElement>('.article__figure img');

    expect(page.querySelector('.article__kicker')?.textContent).toContain('Liner Notes');
    expect(page.querySelector('.article__lead')?.textContent?.trim().length).toBeGreaterThan(0);
    expect(photo?.getAttribute('src')).toBe('/images/works/visual-starlit-maid.jpeg');
    expect(photo?.getAttribute('width')).toMatch(/^\d+$/);
    expect(photo?.getAttribute('height')).toMatch(/^\d+$/);
    expect(photo?.alt.length).toBeGreaterThan(12);
    expect(page.querySelector('.article__figure figcaption')?.textContent).toContain('流星');
    expect(page.querySelector('.article__credits')?.textContent).toContain('Kanon Studio');
  });

  it('links every contents entry to a real ASCII section anchor', async () => {
    const page = parseBody(await readMarkup('journal/ryuseimachi/index.html'));
    const entries = [...page.querySelectorAll<HTMLAnchorElement>('.article__index a')];
    const headingIds = [...page.querySelectorAll('.article__prose h2')].map((h) => h.id);

    expect(entries.length).toBe(headingIds.length);
    expect(headingIds.every((id) => /^section-\d+$/.test(id))).toBe(true);

    for (const [index, entry] of entries.entries()) {
      const href = entry.getAttribute('href') ?? '';
      expect(href).toBe(`#${headingIds[index]}`);
      expect(page.querySelector(`.article__prose h2#${headingIds[index]}`)?.textContent).toContain(
        entry.textContent?.trim(),
      );
    }
  });

  it('closes the article arc with a captioned second photograph', async () => {
    const page = parseBody(await readMarkup('journal/ryuseimachi/index.html'));
    const plate = page.querySelector('.article__prose .prose-figure');
    const image = plate?.querySelector('img');

    expect(image?.getAttribute('src')).toBe('/images/works/visual-morning-bread.jpeg');
    expect(image?.getAttribute('width')).toMatch(/^\d+$/);
    expect(image?.getAttribute('height')).toMatch(/^\d+$/);
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.getAttribute('alt')?.length ?? 0).toBeGreaterThan(12);
    expect(plate?.querySelector('figcaption')?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it('sets single-line payoff lyrics as bare type and verses as boxed quotations', async () => {
    const html = await readMarkup('journal/ryuseimachi/index.html');
    const page = parseBody(html);
    const quotes = [...page.querySelectorAll('.article__prose blockquote')];
    const bare = quotes.filter((quote) => quote.classList.contains('lyric-line'));
    const generated = await readPage('journal/ryuseimachi/index.html');

    expect(bare.length).toBeGreaterThan(0);
    expect(quotes.length).toBeGreaterThan(bare.length);
    expect(bare.every((quote) => quote.textContent?.includes('《'))).toBe(true);
    expect(generated).toMatch(/blockquote\.lyric-line\{[^}]*background:none/);
  });

  it('states the pulled line once instead of repeating the body copy', async () => {
    const page = parseBody(await readMarkup('journal/ryuseimachi/index.html'));
    const pulled = page.querySelector('.article__prose .pull-quote')?.textContent?.trim() ?? '';
    const body = page.querySelector('.article__prose')?.textContent ?? '';

    expect(pulled.length).toBeGreaterThan(0);
    expect(body.split(pulled).length - 1).toBe(1);
  });

  it('surfaces the newest journal entries on home', async () => {
    const page = parseBody(await readMarkup('index.html'));
    const rows = [...page.querySelectorAll('.journal-row')];

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(3);
    expect(page.body.textContent).not.toContain('制作ノートは、ただいま準備中です。');
  });

  it('builds a concise profile with its approved portrait and verified services', async () => {
    const html = await readMarkup('about/index.html');
    const page = parseBody(html);
    const portrait = page.querySelector<HTMLImageElement>('img[src="/images/kanon-avatar.jpg"]');

    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(page.body.textContent).toContain('Kanon Studio');
    expect(portrait?.alt).toContain('Kanon');
    expect(portrait?.alt.length).toBeGreaterThan(12);
    expect(page.body.textContent).toContain('Music');
    expect(page.body.textContent).toContain('Visual');
    expect(page.body.textContent).toContain('Video');
    expect(page.body.textContent).toContain('Journal');
    expect(page.querySelector('[aria-labelledby="about-service-hub-title"]')?.textContent)
      .toContain('Kanon Studio elsewhere');
    expect(html).toContain('href="https://x.com/phstarrion"');
    expect(html).toContain('href="https://suno.com/@phstarrion"');
    expect(html).not.toContain('TikTok');
  });
});
