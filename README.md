# Kanon Studio

Kanon Studio の既存公開サイトを置き換える、静的なポートフォリオサイトです。音楽、生成ビジュアル、映像／MV と制作記録を、作品を中心に掲載します。デザインの基準とトークンは [DESIGN.md](./DESIGN.md) を唯一の正としています。

## Local development

Node.js 20 を使います。最初にロックファイルどおりの依存関係をインストールしてください。

```sh
npm ci
npm run dev
```

リリース前は、次の品質ゲートをすべて実行します。

```sh
npm run check
npm run test:run
npm run build
```

`npm run check` は Astro と TypeScript の検査、`npm run test:run` は生成済みページとアクセシビリティを含むテスト、`npm run build` は GitHub Pages に渡す静的ファイルを `dist/` に生成します。ビルド結果を確認する場合は `npm run preview -- --host 127.0.0.1` を使います。

## Content

作品は `src/content/works/*.md` に追加します。各ファイルの frontmatter には、次の必須フィールドを設定します。

| Field | Description |
| --- | --- |
| `title` | 作品名 |
| `description` | 一覧と詳細で使う簡潔な説明 |
| `category` | `music`、`visual`、`video` のいずれか |
| `publishedAt` | 実在する `YYYY-MM-DD` 形式の公開日 |
| `featured` | Home の選出対象かどうか |
| `cover` | `public/` を基準にしたカバー画像のパス |
| `coverWidth` / `coverHeight` | カバー画像の実寸ピクセル |
| `coverAlt` | 内容を伝える 12 文字以上の代替テキスト |

Home に表示する作品は `featured: true` とし、重複しない正の整数の `featuredOrder` を必ず指定します。任意フィールドは `externalUrl` と対になる `externalLabel`、`genre`、音楽作品用の UUID 形式の `sunoId` です。`externalUrl` は HTTPS URL で、指定する場合は `externalLabel` も必須です。

Journal は `src/content/journal/*.md` に追加します。frontmatter は `title`、`summary`、`category`、`publishedAt`（実在する `YYYY-MM-DD` 形式）です。検証済みの記録だけを追加し、空の場合はサイトの正直な空状態を維持します。

## Publishing

`main` への push（通常はレビュー済みの変更を main にマージしたとき）で GitHub Actions が `npm ci`、`npm run check`、`npm run test:run`、`npm run build` を順に実行します。すべて成功したビルドだけが GitHub Pages にデプロイされ、公開先は <https://phstarrion.github.io/> です。Actions の `workflow_dispatch` からも、同じ品質ゲートを通して手動実行できます。
