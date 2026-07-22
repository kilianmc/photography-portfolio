import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

/*
 * Content model (PROJECT_SPEC.md §3): Works (single photographs) and Collections
 * (named bodies of work). A Collection with `startDate`/`location` also renders
 * as an exhibition — there is no separate Exhibitions type. Schemas are kept
 * flat and stable so Decap CMS can slot in later with no content migration.
 * `coverAlt` / per-image `alt` are REQUIRED for accessibility (spec §10).
 */

const works = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.number(),
      medium: z.string(),
      dimensions: z.string().optional(),
      description: z.string().optional(),
      collection: reference("collections"),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      coverImage: image(),
      coverAlt: z.string(),
      gallery: z
        .array(z.object({ image: image(), alt: z.string() }))
        .optional(),
    }),
});

const collectionsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/collections" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      coverImage: image(),
      coverAlt: z.string(),
      order: z.number().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      // present → the collection page also renders as an exhibition
      location: z.string().optional(),
      city: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }),
});

export const collections = { works, collections: collectionsCollection };
