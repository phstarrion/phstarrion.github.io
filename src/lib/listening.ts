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
    const aDate = a.createdAt ?? a.publishedAt ?? '';
    const bDate = b.createdAt ?? b.publishedAt ?? '';
    return bDate.localeCompare(aDate) || a.id.localeCompare(b.id);
  });
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
