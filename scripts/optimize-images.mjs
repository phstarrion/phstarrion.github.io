// Generates WebP derivatives for every raster image under public/images.
// Run after adding artwork: `npm run images`. Outputs are committed so CI needs no image tooling.
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import sharp from 'sharp';

const root = 'public/images';
const out = join(root, 'opt');
const widths = [480, 800, 1280];
const heroWidths = { 'atelier-moonlight': [960, 1536], 'atelier-moonlight-mobile': [640, 1122] };

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { if (path !== out) yield* walk(path); }
    else if (/\.(png|jpe?g)$/i.test(entry.name)) yield path;
  }
}

let made = 0;
for await (const file of walk(root)) {
  const rel = relative(root, file).replace(/\\/g, '/');
  const base = rel.slice(0, -extname(rel).length);
  if (base.startsWith('games/kanon-port/')) continue; // pixel art stays lossless
  const meta = await sharp(file).metadata();
  const name = base.split('/').pop();
  for (const width of heroWidths[name] ?? widths) {
    if (width > meta.width && width !== Math.min(...(heroWidths[name] ?? widths))) continue;
    const target = join(out, `${base}-${width}.webp`);
    try { await stat(target); continue; } catch {}
    await mkdir(join(out, base, '..'), { recursive: true });
    await sharp(file).resize({ width: Math.min(width, meta.width) }).webp({ quality: 80, effort: 6 }).toFile(target);
    made += 1;
  }
}
console.log(`optimize-images: ${made} file(s) written`);
