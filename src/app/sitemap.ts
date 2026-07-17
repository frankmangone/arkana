import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { defaultLanguage, languages } from "@/lib/i18n-config";
import { getPostPaths } from "@/lib/posts/translations";
import { getAllPosts } from "@/lib/posts";
import { readingLists } from "@/lib/reading-lists";
import { writers } from "@/lib/writers";
import { POSTS_PER_PAGE } from "./[lang]/blog/page/[page]/static-params";

export const dynamic = "force-static";

function url(lang: string, path = ""): string {
  return `${SITE_URL}/${lang}${path ? `/${path}` : ""}/`;
}

function alternatesFor(
  path: string,
  availableLanguages: readonly string[]
): { languages: Record<string, string> } {
  const entries: Record<string, string> = {};
  for (const lang of availableLanguages) {
    entries[lang] = url(lang, path);
  }
  if (availableLanguages.includes(defaultLanguage)) {
    entries["x-default"] = url(defaultLanguage, path);
  }
  return { languages: entries };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static section pages, present in every language
  const staticPaths = ["", "blog", "faq", "reading-lists", "writers"];
  for (const path of staticPaths) {
    for (const lang of languages) {
      entries.push({ url: url(lang, path), alternates: alternatesFor(path, languages) });
    }
  }

  // Blog pagination + per-post dates, per language
  const dates = new Map<string, string>();
  for (const lang of languages) {
    const posts = await getAllPosts(lang);
    for (const post of posts) {
      dates.set(`${lang}:${post.slug}`, post.date);
    }
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    for (let page = 1; page <= totalPages; page++) {
      entries.push({ url: url(lang, `blog/page/${page}`) });
    }
  }

  // Articles — only languages with an existing translation
  const postPaths = await getPostPaths();
  for (const post of postPaths) {
    const path = `blog/${post.folder}/${post.slug}`;
    for (const lang of post.languages) {
      const date = dates.get(`${lang}:${post.folder}/${post.slug}`);
      entries.push({
        url: url(lang, path),
        ...(date ? { lastModified: new Date(date) } : {}),
        alternates: alternatesFor(path, post.languages),
      });
    }
  }

  // Reading lists (ids can differ per language — no alternates)
  for (const lang of languages) {
    for (const list of readingLists[lang] ?? []) {
      entries.push({ url: url(lang, `reading-lists/${list.id}`) });
    }
  }

  // Writer profiles
  for (const writer of Object.values(writers)) {
    if (writer.visible === false) continue;
    const path = `writers/${writer.slug}`;
    for (const lang of languages) {
      entries.push({ url: url(lang, path), alternates: alternatesFor(path, languages) });
    }
  }

  return entries;
}
