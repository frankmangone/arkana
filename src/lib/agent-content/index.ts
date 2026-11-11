import { getPostBySlug } from "@/features/posts/actions";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";
import { getHiddenPostKeys, getPostPaths } from "@/lib/posts/translations";
import type { PostMetadata } from "@/lib/types";
import { getWriter } from "@/lib/writers";
import { toAgentMarkdown } from "./to-markdown";
import { postMarkdownUrl, postUrl } from "./urls";

export { postMarkdownUrl, postUrl } from "./urls";
export { toAgentMarkdown } from "./to-markdown";

export interface PublicPost {
  lang: Locale;
  folder: string;
  slug: string;
  metadata: PostMetadata;
  authorName: string;
  url: string;
  markdownUrl: string;
}

/**
 * Every visible post, once per language it exists in, newest first. This is
 * the one list agent-facing outputs (markdown files, llms.txt, the JSON index)
 * are built from, so a hidden post can't leak through any of them.
 */
export async function getPublicPosts(lang?: Locale): Promise<PublicPost[]> {
  const posts: PublicPost[] = [];

  for (const { folder, slug, languages: available } of await getPostPaths()) {
    for (const postLang of available) {
      if (lang && postLang !== lang) continue;
      const post = await getPostBySlug(`${folder}/${slug}`, postLang);
      if (!post || post.metadata.visible === false) continue;
      posts.push({
        lang: postLang,
        folder,
        slug,
        metadata: post.metadata,
        authorName: getWriter(post.metadata.author ?? "").name,
        url: postUrl(postLang, folder, slug),
        markdownUrl: postMarkdownUrl(postLang, folder, slug),
      });
    }
  }

  return posts.sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
  );
}

/** The agent-readable markdown of one post, or null if it doesn't exist. */
export async function getAgentMarkdown(
  lang: string,
  folder: string,
  slug: string
): Promise<string | null> {
  const post = await getPostBySlug(`${folder}/${slug}`, lang);
  if (!post) return null;

  const [dictionary, hiddenPostKeys] = await Promise.all([
    getDictionary(lang),
    getHiddenPostKeys(),
  ]);

  return toAgentMarkdown({
    content: post.content,
    metadata: post.metadata,
    lang,
    folder,
    slug,
    authorName: getWriter(post.metadata.author ?? "").name,
    // A hidden post may link to other drafts (for previewing), like on the site.
    hiddenPostKeys:
      post.metadata.visible === false ? new Set<string>() : hiddenPostKeys,
    keyConceptsHeading: dictionary.keyConcepts.title,
  });
}
