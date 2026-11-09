// Matches the internal post URLs the wikilink conversion produces:
// /{lang}/blog/{folder}/{slug}, optionally followed by a trailing slash,
// ?query or #anchor.
const POST_HREF = /^\/([^/]+)\/blog\/([^/#?]+)\/([^/#?]+)\/?(?:[#?].*)?$/;

export function hiddenPostKey(
  lang: string,
  folder: string,
  slug: string
): string {
  return `${lang}/${folder}/${slug}`;
}

export function isHiddenPostHref(
  href: string | undefined,
  hiddenPostKeys: ReadonlySet<string>
): boolean {
  const match = href?.match(POST_HREF);
  if (!match) return false;
  const [, lang, folder, slug] = match;
  return hiddenPostKeys.has(hiddenPostKey(lang, folder, slug));
}
