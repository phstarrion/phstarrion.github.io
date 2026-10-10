import type { ListeningTrack } from '../lib/listening';

// This stem-adjusted MP3 has no creation date or Suno ID in its metadata.
// Genre is transcribed from the owner's Suno screenshot (IMG_6635.png).
// Keep the date and full-song link absent until confirmed; upload time is not creation time.
export const additionalPreviews: ListeningTrack[] = [{
  id: 'ogyogi-warukute',
  title: 'お行儀わるくて、けっこう。',
  edition: 'ステム調整版',
  headline: 'お行儀よりも、ビートにまかせて。',
  tags: ['UK Big Beat', 'Breakbeat', 'Rave'],
}];
