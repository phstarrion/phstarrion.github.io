import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { isIsoCalendarDate, validateWorkCoverMetadata } from './lib/content';

const workSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.enum(['music', 'visual', 'video']),
    publishedAt: z
      .string()
      .refine(isIsoCalendarDate, 'publishedAt must be a real ISO YYYY-MM-DD date.')
      .transform((value) => new Date(`${value}T00:00:00.000Z`)),
    featured: z.boolean(),
    featuredOrder: z.number().int().positive().optional(),
    cover: z.string().min(1).optional(),
    coverWidth: z.number().int().positive().optional(),
    coverHeight: z.number().int().positive().optional(),
    coverAlt: z.string().min(12).optional(),
    externalUrl: z.string().url().startsWith('https://').optional(),
    externalLabel: z.string().min(1).optional(),
    genre: z.string().min(1).optional(),
    style: z.enum(['kawaii', 'dark', 'pop']).optional(),
    sunoId: z.string().uuid().optional(),
    audio: z.object({
      trackId: z.string().regex(/^[a-z0-9-]+$/),
      headline: z.string().min(1),
      tags: z.array(z.string().min(1)).min(1).max(3),
    }).optional(),
  })
  .superRefine((work, context) => {
    if (work.audio && work.category !== 'music') {
      context.addIssue({ code: 'custom', path: ['audio'], message: 'Only music works may include audio.' });
    }
    if (!validateWorkCoverMetadata(work)) {
      context.addIssue({
        code: 'custom',
        path: ['cover'],
        message:
          'Visual and video works require complete cover metadata; music covers must be complete or omitted.',
      });
    }

    // Every song must declare which of the three listening modes it belongs to, so a visitor who
    // arrived for one of them can never fall through a gap in the archive filters.
    if (work.category === 'music' && !work.style) {
      context.addIssue({
        code: 'custom',
        path: ['style'],
        message: 'Music works must declare a style of kawaii, dark or pop.',
      });
    }

    if (work.category !== 'music' && work.style) {
      context.addIssue({
        code: 'custom',
        path: ['style'],
        message: 'Only music works may declare a style.',
      });
    }

    const hasExternalUrl = Boolean(work.externalUrl);
    const hasExternalLabel = Boolean(work.externalLabel);

    if (hasExternalUrl !== hasExternalLabel) {
      context.addIssue({
        code: 'custom',
        message: 'externalUrl and externalLabel must be supplied together.',
      });
    }

    if (work.featured && !work.featuredOrder) {
      context.addIssue({
        code: 'custom',
        path: ['featuredOrder'],
        message: 'Featured works require a positive featuredOrder.',
      });
    }

    if (!work.featured && work.featuredOrder) {
      context.addIssue({
        code: 'custom',
        path: ['featuredOrder'],
        message: 'Only featured works may define featuredOrder.',
      });
    }
  });

const works = defineCollection({
  loader: glob({ base: './src/content/works', pattern: '**/*.md' }),
  schema: workSchema,
});

const journalSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1),
    category: z.string().min(1),
    publishedAt: z
      .string()
      .refine(isIsoCalendarDate, 'publishedAt must be a real ISO YYYY-MM-DD date.')
      .transform((value) => new Date(`${value}T00:00:00.000Z`)),
    kicker: z.string().min(1).optional(),
    lead: z.string().min(1).optional(),
    byline: z.string().min(1).optional(),
    cover: z.string().min(1).optional(),
    coverWidth: z.number().int().positive().optional(),
    coverHeight: z.number().int().positive().optional(),
    coverAlt: z.string().min(12).optional(),
    coverCaption: z.string().min(1).optional(),
  })
  .superRefine((entry, context) => {
    const coverFields = [entry.cover, entry.coverWidth, entry.coverHeight, entry.coverAlt];
    const suppliedCoverFields = coverFields.filter((field) => field !== undefined).length;

    if (suppliedCoverFields > 0 && suppliedCoverFields < coverFields.length) {
      context.addIssue({
        code: 'custom',
        path: ['cover'],
        message: 'A journal cover requires cover, coverWidth, coverHeight and coverAlt together.',
      });
    }

    if (entry.coverCaption && !entry.cover) {
      context.addIssue({
        code: 'custom',
        path: ['coverCaption'],
        message: 'coverCaption requires a cover image.',
      });
    }
  });

const journal = defineCollection({
  loader: glob({ base: './src/content/journal', pattern: '**/*.md' }),
  schema: journalSchema,
});

export const collections = { works, journal };
