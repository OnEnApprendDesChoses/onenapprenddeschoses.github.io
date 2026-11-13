import type { CollectionEntry } from "astro:content";

export const ui = {
  fr: {
    blogName: "On en apprend des choses",
    tagline: "Journal d'une dev qui construit des apps, et qui cuisine",
    latest: "Derniers billets",
    about: "À propos",
    readIn: "Lire en",
    allPosts: "Tous les billets",
    noPosts: "Aucun billet pour l'instant.",
    min: "min de lecture",
  },
  en: {
    blogName: "You learn things",
    tagline: "A dev's journal of building apps, and cooking",
    latest: "Latest posts",
    about: "About",
    readIn: "Read in",
    allPosts: "All posts",
    noPosts: "No posts yet.",
    min: "min read",
  },
};

export function formatDate(d: Date, lang: string) {
  return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// Retrouve la traduction d'un billet via translationKey
export function findTranslation(
  post: CollectionEntry<"blog">,
  all: CollectionEntry<"blog">[]
): CollectionEntry<"blog"> | undefined {
  if (!post.data.translationKey) return undefined;
  return all.find((p) => p.id !== post.id && p.data.translationKey === post.data.translationKey);
}
