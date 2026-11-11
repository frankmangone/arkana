import { languages, type Locale } from "@/lib/i18n-config";
import { SITE_URL } from "@/lib/site-config";
import type { PublicPost } from "./index";
import { seriesName } from "./series";

/** URL of a language's article index. */
export const postsIndexUrl = (lang: string) => `${SITE_URL}/${lang}/posts.json`;

/** URL of the index of indexes. */
export const rootIndexUrl = `${SITE_URL}/api/index.json`;

/**
 * Every article in one language as data, newest first: enough to find the
 * right one without fetching them all. `translations` links the same article
 * in the other languages it exists in.
 */
export function buildPostsIndex(
  lang: Locale,
  posts: PublicPost[],
  allPosts: PublicPost[] = posts
) {
  const inLanguage = posts.filter((post) => post.lang === lang);

  const series = new Map<string, number>();
  for (const post of inLanguage) {
    series.set(post.folder, (series.get(post.folder) ?? 0) + 1);
  }

  return {
    lang,
    count: inLanguage.length,
    series: [...series.entries()].map(([slug, articles]) => ({
      slug,
      name: seriesName(slug),
      articles,
    })),
    posts: inLanguage.map((post) => ({
      slug: `${post.folder}/${post.slug}`,
      title: post.metadata.title,
      description: post.metadata.description ?? "",
      series: post.folder,
      seriesName: seriesName(post.folder),
      date: post.metadata.date,
      author: post.authorName,
      tags: post.metadata.tags ?? [],
      readingTime: post.metadata.readingTime ?? null,
      url: post.url,
      markdownUrl: post.markdownUrl,
      translations: Object.fromEntries(
        allPosts
          .filter(
            (other) =>
              other.lang !== lang &&
              other.folder === post.folder &&
              other.slug === post.slug
          )
          .map((other) => [
            other.lang,
            { url: other.url, markdownUrl: other.markdownUrl },
          ])
      ),
    })),
  };
}

/** The entry point: which indexes exist and where the other machine-readable files are. */
export function buildRootIndex(posts: PublicPost[]) {
  return {
    name: "Arkana",
    description:
      "Cryptography, blockchain and mathematics, explained clearly: long-form articles organised in series.",
    languages: languages.map((lang) => ({
      lang,
      count: posts.filter((post) => post.lang === lang).length,
      postsUrl: postsIndexUrl(lang),
    })),
    llmsTxt: `${SITE_URL}/llms.txt`,
    sitemap: `${SITE_URL}/sitemap.xml`,
    rss: `${SITE_URL}/en/rss.xml`,
  };
}
