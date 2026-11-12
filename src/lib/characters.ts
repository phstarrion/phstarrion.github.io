/**
 * Character profiles. Publish only what the creator has decided; undecided fields stay null
 * and are simply not rendered (no invented biography).
 */
export const kotone = {
  name: '琴音',
  reading: 'ことね',
  nickname: 'ことにゃん',
  /** Decided later: family name and its reading. */
  familyName: null as string | null,
  familyReading: null as string | null,
  /** Decided later: background such as roots or birthplace. */
  origin: null as string | null,
  role: 'Kanon Studioの看板キャラクター',
  lead: '星と音の名前をもつ、スタジオの顔。',
  nameNote: '「琴」は、夜空のこと座と、音を奏でる琴から。プロデューサーの花音（かのん）と、同じ「音」の字でつながっています。',
  traits: [
    { label: '髪', value: '白銀にラベンダーがかかった、ふわふわのロング' },
    { label: '瞳', value: 'むらさき' },
    { label: '耳', value: 'ねこ耳' },
    { label: 'トレードマーク', value: '金色の星飾りと黒いリボン、ピンクの丸眼鏡' },
  ],
} as const;

export const companions = [
  {
    id: 'kanon',
    name: '花音',
    reading: 'かのん',
    role: 'プロデューサー',
    description: '青い長い髪に、青いバラの髪飾り。月明かりの音楽室で、Kanon Studioの音楽と世界をつくっています。',
    image: '/images/atelier-moonlight-mobile.png',
    imageAlt: '月明かりの音楽室で頬杖をつく、青い髪の花音',
    width: 1122,
    height: 1402,
    position: 'center 40%',
    link: { href: '/music/', label: '花音の音楽を聴く' },
  },
  {
    id: 'nagi',
    name: '瀬戸なぎ',
    reading: 'せと なぎ',
    role: '解説役',
    description: '地図を片手に、地形から歴史や産業の「なぜ」を読み解く、「なぎの地図ノート」の案内人。',
    image: '/images/nagi/nagi-normal.webp',
    imageAlt: '地図を手に立つ瀬戸なぎ。茶色の髪に青緑のスカーフ、探検ジャケット',
    width: 336,
    height: 900,
    position: 'center top',
    link: { href: '/videos/', label: 'なぎの地図ノートを見る' },
  },
] as const;

export const kotoneDisplayName = kotone.familyName ? `${kotone.familyName} ${kotone.name}` : kotone.name;
export const kotoneDisplayReading = kotone.familyReading ? `${kotone.familyReading} ${kotone.reading}` : kotone.reading;
