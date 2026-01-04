# PHStarrion - AI Music Creator Portfolio

AI Generated Beats & Vibes - AI楽曲クリエイターの個人ホームページ

## 🎵 概要

このサイトは、Astro + Tailwind CSSで構築された、AI楽曲クリエイターのポートフォリオサイトです。
2026年トレンドのglassmorphism、ダークモード、micro-animationsを取り入れた没入感のあるデザインが特徴です。

### 主な機能

- **Heroセクション**: キャッチーなタイトルとCTAボタン
- **最新楽曲**: Suno AIで生成された楽曲の埋め込み（プレースホルダー配置済み）
- **SNSハブ**: X (Twitter)、TikTok、YouTube、Sunoへのリンク
- **楽曲ポートフォリオ**: グリッドレイアウトの楽曲一覧
- **自己紹介ページ**: プロフィール、ビジョン、技術スタック

### デザイン特徴

- ✨ **Glassmorphism**: 透明感のあるガラスモーフィズムデザイン
- 🌙 **ダークモード**: デフォルトでダークテーマ
- 🎨 **グラデーション**: A.I.Aqua系（シアン〜ブルー）のアクセントカラー
- 🎭 **Micro-animations**: フローティング、ホバー効果、スクロールアニメーション
- 📱 **レスポンシブ**: モバイル・タブレット・デスクトップ完全対応

## 🚀 プロジェクト構成

```text
/
├── public/              # 静的ファイル（favicon等）
├── src/
│   ├── pages/          # ページファイル
│   │   ├── index.astro # Homeページ
│   │   ├── works.astro # 楽曲ポートフォリオ
│   │   └── about.astro # 自己紹介
│   └── styles/
│       └── global.css  # グローバルスタイル（Tailwind + カスタム）
├── astro.config.mjs    # Astro設定
└── package.json
```

## 🧞 コマンド

プロジェクトのルートディレクトリで以下のコマンドを実行してください：

| コマンド | 説明 |
| :--- | :--- |
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバー起動（`localhost:4321`） |
| `npm run build` | 本番用ビルド（`./dist/`に出力） |
| `npm run preview` | ビルド後のプレビュー |

## 📦 Vercelへのデプロイ手順

### 方法1: Vercel CLI（推奨）

1. **Vercel CLIのインストール**
   ```bash
   npm install -g vercel
   ```

2. **ログイン**
   ```bash
   vercel login
   ```

3. **デプロイ**
   ```bash
   # 初回デプロイ（プロジェクト設定）
   vercel
   
   # 本番環境へデプロイ
   vercel --prod
   ```

### 方法2: Vercel Dashboard（GUI）

1. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Initial commit: AI Music Creator Portfolio"
   git push origin main
   ```

2. **Vercelダッシュボードでインポート**
   - [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
   - "Add New Project"をクリック
   - GitHubリポジトリを選択
   - フレームワークプリセット: **Astro**（自動検出）
   - "Deploy"をクリック

### デプロイ設定

Vercelは自動的にAstroプロジェクトを検出しますが、必要に応じて以下を設定：

- **Framework Preset**: Astro
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🎨 カスタマイズ方法

### 1. SNSリンクの更新

`src/pages/index.astro`と`src/pages/about.astro`の以下の部分を編集：

```javascript
const socialLinks = [
  { name: 'X (Twitter)', url: 'https://x.com/yourhandle', ... },
  { name: 'TikTok', url: 'https://tiktok.com/@yourhandle', ... },
  // ...
];
```

### 2. Suno楽曲の埋め込み

`src/pages/index.astro`と`src/pages/works.astro`のプレースホルダー部分に、
Sunoの実際のiframeコードを配置：

```html
<!-- プレースホルダーを以下に置き換え -->
<iframe src="https://suno.com/embed/YOUR_TRACK_ID" 
        width="100%" 
        height="400" 
        frameborder="0">
</iframe>
```

### 3. カラーテーマの変更

`src/styles/global.css`のグラデーション定義を編集：

```css
.gradient-accent {
  background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);
  /* お好みの色に変更 */
}
```

### 4. プロフィール情報の更新

`src/pages/about.astro`の自己紹介文を編集してください。

## 🛠️ 技術スタック

- **Astro** v5.16.6 - 静的サイトジェネレーター
- **Tailwind CSS** v4 - ユーティリティファーストCSSフレームワーク
- **TypeScript** - 型安全性
- **Vercel** - ホスティング（推奨）

## 📝 ライセンス

© 2026 PHStarrion. All rights reserved.

## 🤝 サポート

質問や問題がある場合は、以下からお問い合わせください：

- X (Twitter): [@yourhandle](https://x.com/yourhandle)
- GitHub Issues: このリポジトリのIssuesセクション

---

**Powered by AI & Creativity** ✨
