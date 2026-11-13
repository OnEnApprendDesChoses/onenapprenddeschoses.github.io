import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    lang: z.enum(["fr", "en"]),
    tags: z.array(z.string()).default([]),
    translationKey: z.string().optional(), // relie un billet FR à sa traduction EN
  }),
});

export const collections = { blog };
