import { defaultLanguage } from "@/lib/i18n-config";
import { SITE_URL } from "@/lib/site-config";
import type { PublicPost } from "./index";
import { postsIndexUrl, rootIndexUrl } from "./posts-index";
import { seriesName } from "./series";

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();
const escapeLabel = (text: string) => text.replace(/([[\]])/g, "\\$1");

/**
 * The site's /llms.txt (https://llmstxt.org): what Arkana is, then every
 * article, grouped by series, as a link to its markdown version plus the
 * one-line description. An article's translations follow it on the same line.
 *
 * `posts` is one entry per (article, language), as from `getPublicPosts`.
 */
export function buildLlmsTxt(posts: PublicPost[]): string {
  // One entry per article, with all the languages it exists in.
  const articles = new Map<string, PublicPost[]>();
  for (const post of posts) {
    const key = `${post.folder}/${post.slug}`;
    articles.set(key, [...(articles.get(key) ?? []), post]);
  }

  // Each article is listed in its default-language version when there is one;
  // the other languages are links beside it.
  const bySeries = new Map<
    string,
    { main: PublicPost; others: PublicPost[] }[]
  >();
  for (const versions of articles.values()) {
    const main =
      versions.find((post) => post.lang === defaultLanguage) ?? versions[0];
    const others = versions
      .filter((post) => post !== main)
      .sort((a, b) => a.lang.localeCompare(b.lang));
    bySeries.set(main.folder, [
      ...(bySeries.get(main.folder) ?? []),
      { main, others },
    ]);
  }

  const time = (post: PublicPost) => new Date(post.metadata.date).getTime();
  // A series reads in publication order; the most recently updated series
  // comes first.
  const series = [...bySeries.entries()]
    .map(([folder, entries]) => ({
      folder,
      entries: entries.sort((a, b) => time(a.main) - time(b.main)),
    }))
    .sort(
      (a, b) =>
        time(b.entries[b.entries.length - 1].main) -
        time(a.entries[a.entries.length - 1].main)
    );

  const lines = [
    "# Arkana",
    "",
    "> Cryptography, blockchain and mathematics, explained clearly: long-form articles organised in series.",
    "",
    `Every article below links to its markdown version (math is LaTeX between \`$\` signs). The HTML page of an article is the same URL without the trailing \`index.md\`. Articles are written in English; where a translation exists, its language code (es, pt) follows the entry as a link. Other entry points: a JSON index of every article ([${defaultLanguage}](${postsIndexUrl(defaultLanguage)}); the others are listed in [the root index](${rootIndexUrl})), the [sitemap](${SITE_URL}/sitemap.xml) and the [RSS feed](${SITE_URL}/${defaultLanguage}/rss.xml).`,
  ];

  for (const { folder, entries } of series) {
    lines.push("", `## ${seriesName(folder)}`, "");
    for (const { main, others } of entries) {
      const description = oneLine(main.metadata.description ?? "");
      const translations = others.length
        ? ` (${others.map((post) => `[${post.lang}](${post.markdownUrl})`).join(", ")})`
        : "";
      lines.push(
        `- [${escapeLabel(oneLine(main.metadata.title))}](${main.markdownUrl})${description ? `: ${description}` : ""}${translations}`
      );
    }
  }

  return lines.join("\n") + "\n";
}
