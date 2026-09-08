import { defineConfig } from 'astro/config';

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
      node.properties = { ...node.properties, id: `section-${index}` };
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
  markdown: {
    rehypePlugins: [asciiHeadingIds],
  },
});
