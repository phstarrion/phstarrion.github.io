/**
 * Projects beyond the works collection. Only verified destinations are published:
 * a null URL renders an honest "準備中" label instead of a link.
 */
export const nagi = {
  name: 'なぎの地図ノート',
  host: '瀬戸なぎ',
  lead: '地図と地形から、歴史・産業・暮らしの「なぜ」を読み解く解説動画シリーズ。',
  /** Set to the verified https:// channel or playlist URL to publish the watch links. */
  youtubeUrl: null as string | null,
  series: [
    { id: 'main', title: '地図ノート', theme: '地形と技術から歴史を読む', episodes: ['神戸は山を削って海をつくった', '秀吉の水攻めは「地形」で決まった？', 'なぜ灘は日本一の酒どころになった？'] },
    { id: 'energy', title: '資源とエネルギー', theme: '水車・石炭・電気がたどった道', episodes: ['灘の酒は水車が造った', '江戸の灯りは菜の花から', '関西の電気は黒部から'] },
    { id: 'transport', title: '交通と物流', theme: '港・鉄道・橋が「そこ」にある理由', episodes: ['神戸港はなぜ良港なのか', '阪神間に鉄道が3本並ぶ理由', '明石海峡大橋はなぜ柱が2本だけ？'] },
    { id: 'voyage', title: '大航海時代', theme: '風と海流でたどる海の道', episodes: ['インド洋の“風の時刻表”', '喜望峰は“嵐の岬”だった', '石見の銀が世界を回した？'] },
    { id: 'industry', title: '産業', theme: 'その産地が、その場所にある理由', episodes: ['豊岡のかばんは、なぜ豊岡なのか', '今治タオルは、なぜ今治なのか', '児島のジーンズは、なぜ干拓地なのか'] },
  ],
} as const;

export const kanonPort = {
  title: 'かのんの港町',
  status: '制作中',
  genre: 'ドット絵のブラウザRPG · 交易と航海',
  lead: '音に呼ばれて、大航海時代の海へ。',
  description: '近未来から来たかのんと、頭の上の「鳥さん」——呪いで小鳥にされた伝説の船乗り。港で仕入れ、海を渡り、発見を重ねながら、帰り道を探す物語。',
  features: ['港町を歩いて、交易品を仕入れる', '船を選んで、島から島へ航海', '歌のかけらが、旅の力になる'],
  /** Set to a verified public https:// URL when the game opens to players. */
  playUrl: null as string | null,
} as const;
