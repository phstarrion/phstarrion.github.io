import { defineConfig } from 'astro/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Serve WebP derivatives (scripts/optimize-images.mjs) through `srcset` while every `src` keeps
 * pointing at the original artwork. No wrapper element is added, so layout selectors are unchanged
 * and browsers without WebP fall back to the original file.
 */
const responsiveArtwork = () => ({
  name: 'responsive-artwork',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const dist = fileURLToPath(dir);
      const pages = [];
      const walk = async (folder) => {
        for (const entry of await readdir(folder, { withFileTypes: true })) {
          const path = join(folder, entry.name);
          if (entry.isDirectory()) await walk(path);
          else if (entry.name.endsWith('.html')) pages.push(path);
        }
      };
      await walk(dist);
      const variants = (base) => [480, 800, 960, 1280, 1536]
        .filter((width) => existsSync(join(dist, 'images/opt', `${base}-${width}.webp`)))
        .map((width) => `/images/opt/${base}-${width}.webp ${width}w`);
      for (const page of pages) {
        const html = await readFile(page, 'utf8');
        const next = html.replace(/<img\b[^>]*>/g, (tag) => {
          if (/\ssrcset=/.test(tag)) return tag;
          const match = tag.match(/\ssrc="\/images\/([^"]+)\.(?:png|jpe?g)"/i);
          if (!match) return tag;
          const set = variants(match[1]);
          if (!set.length) return tag;
          const sizes = tag.match(/\sdata-sizes="([^"]+)"/)?.[1] ?? '(max-width: 767px) 92vw, (max-width: 1280px) 46vw, 560px';
          return tag.replace(/<img\b/, `<img srcset="${set.join(', ')}" sizes="${sizes}"`);
        });
        if (next !== html) await writeFile(page, next);
      }
    },
  },
});

const headingTags = new Set(['h2', 'h3', 'h4', 'h5', 'h6']);

/**
 * Japanese headings otherwise produce non-ASCII slugs such as `#夜が明ける`, which are awkward to
 * share and unusable in tooling that assumes ASCII selectors. Number the headings instead so every
 * anchor stays stable and linkable.
 */
const asciiHeadingIds = () => (tree) => {
  let index = 0;

  const visit = (node) => {
    if (headingTags.has(node.tagName)) {
      index += 1;
      node.properties = { ...node.properties, id: `section-${index}`, tabIndex: -1 };
    }

    for (const child of node.children ?? []) {
      visit(child);
    }
  };

  visit(tree);
};

export default defineConfig({
  site: 'https://phstarrion.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [responsiveArtwork()],
  markdown: {
    rehypePlugins: [asciiHeadingIds],
  },
});
