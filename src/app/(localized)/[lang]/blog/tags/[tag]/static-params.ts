import { languages } from "@/lib/i18n-config";
import { getAllPosts } from "@/lib/posts";

export interface TagPageParams {
  lang: string;
  tag: string;
}

export async function getTagsForLanguage(lang: string): Promise<string[]> {
  const posts = await getAllPosts(lang);
  return Array.from(new Set(posts.flatMap((post) => post.tags))).sort();
}

export async function generateStaticParams(): Promise<TagPageParams[]> {
  const params: TagPageParams[] = [];
  for (const lang of languages) {
    for (const tag of await getTagsForLanguage(lang)) {
      params.push({ lang, tag });
    }
  }
  return params;
}
