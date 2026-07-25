import tagsData from "@/data/tags.json";

interface TagEntry {
  slug: string;
  translations: Record<string, string>;
}

const tags: Record<string, Record<string, string>> = Object.fromEntries(
  (tagsData as TagEntry[]).map((t) => [t.slug, t.translations])
);

export type TagKey = string;

export function getTagDisplayName(tag: TagKey, lang: string): string {
  return tags[tag]?.[lang] || tag;
}

export function getAllTags(
  lang: string
): Array<{ key: TagKey; displayName: string }> {
  return Object.entries(tags).map(([key, translations]) => ({
    key,
    displayName: translations[lang] || key,
  }));
}
