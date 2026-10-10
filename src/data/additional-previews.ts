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
}, {
  id: 'hoshi-ga-terasu-mahou-monogatari',
  title: '星が照らす魔法物語',
  headline: '星の物語を、音でたどって。',
  tags: ['オリジナル楽曲'],
  // Google Drive / SUNO楽曲. MP3 contains no creation date or Suno song ID.
  // Do not substitute its upload timestamp for the unknown creation/publication date.
},
// WAV imports: creation dates and Suno IDs come from embedded source metadata.
{
  "id": "aini-ikuyo",
  "title": "会いにいくよ",
  "headline": "この曲の世界を、30秒から。",
  "tags": [
    "Suno"
  ],
  "createdAt": "2026-09-17",
  "sunoUrl": "https://suno.com/song/38ecddb3-8f41-41e9-a285-25d20b4ffdf8"
},
{
  "id": "futaribun-8bit-mix",
  "title": "ふたりぶんのセーブポイント (8bit Mix)",
  "headline": "ふたりぶんのセーブポイント、8bit Mix。",
  "tags": [
    "8bit Mix"
  ],
  "createdAt": "2026-09-05",
  "sunoUrl": "https://suno.com/song/6e94a0d4-a0d0-46f9-a360-a29a5b2b47b5",
  "cover": "/images/works/music-futaribun-no-save-point.jpeg",
  "detailUrl": "/works/futaribun-no-save-point/"
},
{
  "id": "ushiro-minaide",
  "title": "うしろ、みないで",
  "headline": "この曲の世界を、30秒から。",
  "tags": [
    "Suno"
  ],
  "createdAt": "2026-09-13",
  "sunoUrl": "https://suno.com/song/0880c2a9-145e-4e73-ab32-8a98acf135d5"
},
{
  "id": "silent-ledger-remastered",
  "title": "Silent Ledger (Remastered)",
  "headline": "Silent Ledgerのリマスター版。",
  "tags": [
    "リマスター"
  ],
  "createdAt": "2026-09-19",
  "sunoUrl": "https://suno.com/song/05cacef7-1490-4ba6-ae36-64113f83dbc4",
  "cover": "/images/works/music-silent-ledger.jpeg",
  "detailUrl": "/works/silent-ledger/"
},
{
  "id": "maou-wo-taoshini",
  "title": "魔王を倒しにいってきます",
  "headline": "この曲の世界を、30秒から。",
  "tags": [
    "Suno"
  ],
  "createdAt": "2026-09-19",
  "sunoUrl": "https://suno.com/song/34781c64-8d02-451d-bd30-216b61306fe0"
}
];
