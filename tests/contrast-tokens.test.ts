import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/global.css', 'utf8');
const themes = [
  ['default', readFileSync('src/styles/tokens.css', 'utf8')],
  ['night', css.split('body.theme-night {')[1].split('}')[0]],
] as const;
function luminance(hex: string) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a: string, b: string) {
  const [dark, light] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (light + .05) / (dark + .05);
}
describe('authored theme contrast, excluding rendered CSS and image backgrounds', () => {
  it.each(themes)('%s supports normal text and meaningful control edges', (_name, source) => {
    const colors = Object.fromEntries([...source.matchAll(/--color-([\w-]+):\s*(#[a-f\d]{6});/gi)].map(m => [m[1], m[2]]));
    for (const background of ['canvas', 'surface', 'lavender', 'blue-surface']) {
      for (const foreground of ['ink', 'muted', 'primary', 'kanon-blue']) {
        expect(contrast(colors[foreground], colors[background]), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    for (const background of ['canvas', 'surface', 'lavender']) {
      expect(contrast(colors['control-border'], colors[background])).toBeGreaterThanOrEqual(3);
    }
    expect(contrast(colors.surface, colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.focus, colors.canvas)).toBeGreaterThanOrEqual(3);
  });
});
