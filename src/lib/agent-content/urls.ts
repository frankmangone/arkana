import { SITE_URL } from "@/lib/site-config";

/** Absolute URL of an article's HTML page. */
export function postUrl(lang: string, folder: string, slug: string): string {
  return `${SITE_URL}/${lang}/blog/${folder}/${slug}/`;
}

/** Absolute URL of an article's markdown version (see the `index.md` route). */
export function postMarkdownUrl(
  lang: string,
  folder: string,
  slug: string
): string {
  return `${postUrl(lang, folder, slug)}index.md`;
}
