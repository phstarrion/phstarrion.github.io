import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  filterWorks,
  isIsoCalendarDate,
  selectFeaturedWorks,
  sortWorksNewestFirst,
  validateWorkCoverMetadata,
} from '../src/lib/content';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const worksDirectory = join(testDirectory, '..', 'src', 'content', 'works');
const expectedCoverDimensions: Record<string, [number, number]> = {
  '/images/works/visual-cheerful-wink.jpeg': [1122, 1402],
  '/images/works/visual-gentle-patrol.jpeg': [1122, 1402],
  '/images/works/visual-violet-ribbons.jpeg': [1122, 1402],
  '/images/works/visual-patchwork-garden.jpeg': [1122, 1402],
  '/images/works/visual-twilight-ripples.jpeg': [1122, 1402],
  '/images/works/visual-water-mirror.jpeg': [1122, 1402],
  '/images/works/visual-bouquet-in-sunlight.jpeg': [1122, 1402],
  '/images/works/visual-floral-arcade.jpeg': [1122, 1402],
  '/images/works/visual-white-garden.jpeg': [1122, 1402],
  '/images/works/visual-after-school.jpeg': [1122, 1402],
  '/images/works/visual-celestial-princess.jpeg': [1122, 1402],
  '/images/works/visual-etoile-violet.jpeg': [1122, 1402],
  '/images/works/visual-morning-bread.jpeg': [1122, 1402],
  '/images/works/visual-nocturne-dress.jpeg': [1122, 1402],
  '/images/works/visual-starlit-maid.jpeg': [1122, 1402],
  '/images/works/visual-tea-time.jpeg': [1122, 1402],
  '/images/works/visual-window-maid.jpeg': [768, 1024],
};

const frontmatterValue = (source: string, key: string) =>
  source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim();

const works = [
  {
    slug: 'older',
    category: 'music',
    publishedAt: new Date('2025-01-01'),
    featured: true,
    featuredOrder: 2,
  },
  {
    slug: 'newer',
    category: 'video',
    publishedAt: new Date('2026-01-01'),
    featured: true,
    featuredOrder: 1,
  },
  {
    slug: 'visual',
    category: 'visual',
    publishedAt: new Date('2025-06-01'),
    featured: false,
  },
] as const;

describe('work content helpers', () => {
  it('sorts newest first without mutating input', () => {
    expect(sortWorksNewestFirst(works).map((work) => work.slug)).toEqual([
      'newer',
      'visual',
      'older',
    ]);
    expect(works[0].slug).toBe('older');
  });

  it('filters a requested category and supports all', () => {
    expect(filterWorks(works, 'music').map((work) => work.slug)).toEqual([
      'older',
    ]);
    expect(filterWorks(works, 'all')).toHaveLength(3);
  });

  it('selects featured works by explicit editorial order', () => {
    expect(selectFeaturedWorks(works, 1).map((work) => work.slug)).toEqual([
      'newer',
    ]);
  });
});

describe('work content schema dates', () => {
  it('accepts a valid leap-day ISO date', () => {
    expect(isIsoCalendarDate('2024-02-29')).toBe(true);
  });

  it('rejects an ISO date with a calendar overflow', () => {
    expect(isIsoCalendarDate('2026-02-30')).toBe(false);
  });
});

describe('work cover metadata', () => {
  it('allows complete or absent music covers but requires complete visual and video covers', () => {
    const completeCover = {
      cover: '/images/works/example.jpeg',
      coverAlt: '作品の内容を説明する十分な代替テキスト',
      coverWidth: 1200,
      coverHeight: 1500,
    };

    expect(validateWorkCoverMetadata({ category: 'music' })).toBe(true);
    expect(validateWorkCoverMetadata({ category: 'music', cover: completeCover.cover })).toBe(false);
    expect(validateWorkCoverMetadata({ category: 'music', ...completeCover })).toBe(true);
    expect(validateWorkCoverMetadata({ category: 'visual' })).toBe(false);
    expect(validateWorkCoverMetadata({ category: 'visual', ...completeCover })).toBe(true);
    expect(validateWorkCoverMetadata({ category: 'video' })).toBe(false);
    expect(validateWorkCoverMetadata({ category: 'video', ...completeCover })).toBe(true);
  });

  it('keeps visual cover metadata complete and removes portrait metadata from music', async () => {
    const filenames = (await readdir(worksDirectory)).filter((filename) => filename.endsWith('.md'));
    const records = await Promise.all(
      filenames.map(async (filename) => {
        const source = await readFile(join(worksDirectory, filename), 'utf8');
        return {
          category: frontmatterValue(source, 'category'),
          cover: frontmatterValue(source, 'cover'),
          coverAlt: frontmatterValue(source, 'coverAlt'),
          width: frontmatterValue(source, 'coverWidth'),
          height: frontmatterValue(source, 'coverHeight'),
        };
      }),
    );

    const music = records.filter(({ category }) => category === 'music');
    const visual = records.filter(({ category }) => category === 'visual');

    // Counts come from the content directory itself so publishing a work does not fail the suite;
    // what matters is that every record is categorised and carries the right cover metadata.
    expect(records.length).toBeGreaterThan(0);
    expect(music.length + visual.length).toBe(records.length);
    // A music work may ship without artwork (it then renders as an editorial title plate), but a
    // partial cover would produce a broken or unlabelled image.
    for (const { cover, coverAlt, width, height } of music) {
      const supplied = [cover, coverAlt, width, height].filter((field) => field !== undefined);
      expect([0, 4]).toContain(supplied.length);

      if (cover) {
        expect(coverAlt?.length).toBeGreaterThanOrEqual(12);
        expect(Number(width)).toBeGreaterThan(0);
        expect(Number(height)).toBeGreaterThan(0);
      }
    }

    for (const { cover, coverAlt, width, height } of visual) {
      expect(coverAlt?.length).toBeGreaterThanOrEqual(12);
      expect([Number(width), Number(height)], cover).toEqual(
        expectedCoverDimensions[cover ?? ''],
      );
    }
  });
});
