import { expect, it } from 'vitest';
import { getActiveServices } from '../src/lib/services';

it('omits services without a verified URL', () => {
  expect(
    getActiveServices({
      x: 'https://x.com/phstarrion',
      suno: 'https://suno.com/@phstarrion',
      tiktok: null,
    }),
  ).toEqual([
    { id: 'x', label: 'X', url: 'https://x.com/phstarrion' },
    { id: 'suno', label: 'Suno', url: 'https://suno.com/@phstarrion' },
  ]);
});

it('omits malformed and non-secure service URLs', () => {
  expect(
    getActiveServices({
      x: 'http://x.com/phstarrion',
      suno: 'not a URL',
      tiktok: null,
    }),
  ).toEqual([]);
});
