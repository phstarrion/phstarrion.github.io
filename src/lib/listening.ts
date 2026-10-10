import type { CollectionEntry } from 'astro:content';
import { additionalPreviews } from '../data/additional-previews';

export interface ListeningTrack {
  id: string;
  title: string;
  headline: string;
  tags: string[];
  createdAt?: string;
  publishedAt?: string;
  cover?: string;
  coverAlt?: string;
  sunoUrl?: string;
  detailUrl?: string;
  edition?: string;
  previewAvailable?: boolean;
}

// Source dates are explicit: never infer composition dates from MP3 upload timestamps.
const verifiedCreationDates: Record<string, string> = {
  hodoke: '2026-05-02', // Original MP3's Suno creation metadata.
};

export function sortListeningTracks(tracks: readonly ListeningTrack[]): ListeningTrack[] {
  return [...tracks].sort((a, b) => {
    const availability = Number(a.previewAvailable === false) - Number(b.previewAvailable === false);
    if (availability) return availability;
    const aDate = a.createdAt ?? a.publishedAt ?? '';
    const bDate = b.createdAt ?? b.publishedAt ?? '';
    return bDate.localeCompare(aDate) || a.id.localeCompare(b.id);
  });
}

/** Available previews first; newest verified dates within each availability group. */
export function getListeningCatalog(works: CollectionEntry<'works'>[]): ListeningTrack[] {
  return sortListeningTracks([
    ...works.filter(work => work.data.audio).map(workToListeningTrack),
    ...additionalPreviews,
    ...works.filter(work => work.data.category === 'music' && !getWorkPreview(work)).map(work => ({
      id: work.id, title: work.data.title, headline: work.data.description, tags: [],
      publishedAt: work.data.publishedAt.toISOString().slice(0, 10),
      cover: work.data.cover, coverAlt: work.data.coverAlt, detailUrl: `/works/${work.id}/`,
      sunoUrl: work.data.externalUrl, previewAvailable: false,
    })),
  ]);
}

export function workToListeningTrack(work: CollectionEntry<'works'>): ListeningTrack {
  if (!work.data.audio) throw new Error(`Missing preview metadata: ${work.id}`);
  return {
    id: work.data.audio.trackId,
    title: work.data.title,
    headline: work.data.audio.headline,
    tags: work.data.audio.tags,
    createdAt: verifiedCreationDates[work.id],
    publishedAt: work.data.publishedAt.toISOString().slice(0, 10),
    cover: work.data.cover,
    coverAlt: work.data.coverAlt,
    sunoUrl: work.data.sunoId ? `https://suno.com/song/${work.data.sunoId}` : undefined,
    detailUrl: `/works/${work.id}/`,
  };
}

/** Match existing work pages to exact previews or explicitly named alternate editions. */
export function getWorkPreview(work: CollectionEntry<'works'>): ListeningTrack | undefined {
  if (work.data.audio) return workToListeningTrack(work);
  return additionalPreviews.find(track => track.detailUrl === `/works/${work.id}/`);
}
