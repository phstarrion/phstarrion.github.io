export type WorkCategory = 'music' | 'visual' | 'video';

type WorkCoverMetadata = {
  category: WorkCategory;
  cover?: string;
  coverAlt?: string;
  coverWidth?: number;
  coverHeight?: number;
};

const isoCalendarDate = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoCalendarDate(value: string): boolean {
  if (!isoCalendarDate.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateWorkCoverMetadata(work: WorkCoverMetadata): boolean {
  const coverFields = [work.cover, work.coverAlt, work.coverWidth, work.coverHeight];
  const suppliedFields = coverFields.filter((value) => value !== undefined).length;
  const hasCompleteCover = suppliedFields === coverFields.length;

  return work.category === 'music'
    ? suppliedFields === 0 || hasCompleteCover
    : hasCompleteCover;
}

type WorkLike = {
  category: WorkCategory;
  featured: boolean;
  featuredOrder?: number;
  publishedAt: Date;
};

export function sortWorksNewestFirst<T extends WorkLike>(works: readonly T[]): T[] {
  return [...works].sort(
    (first, second) => second.publishedAt.getTime() - first.publishedAt.getTime(),
  );
}

export function filterWorks<T extends WorkLike>(
  works: readonly T[],
  category: WorkCategory | 'all',
): T[] {
  return category === 'all' ? [...works] : works.filter((work) => work.category === category);
}

export function selectFeaturedWorks<T extends WorkLike>(works: readonly T[], limit: number): T[] {
  return works
    .filter((work) => work.featured)
    .sort(
      (first, second) =>
        (first.featuredOrder ?? Number.POSITIVE_INFINITY) -
        (second.featuredOrder ?? Number.POSITIVE_INFINITY),
    )
    .slice(0, limit);
}
