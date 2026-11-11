import { splitKeyConcepts } from "@/components/ui/post-content/validate-key-concepts";
import { deckToPlainText } from "@/lib/agent-content/key-concepts-markdown";
import { seriesName } from "@/lib/agent-content/series";
import { postMarkdownUrl } from "@/lib/agent-content/urls";
import { SITE_URL, withLocalePath, withSiteUrl } from "@/lib/site-config";
import type { Post } from "@/lib/types";
import type { Writer } from "@/lib/writers";

interface BlogPostingOptions {
  post: Post;
  lang: string;
  /** The post's path under blog/, "{folder}/{slug}". */
  slug: string;
  writer: Pick<Writer, "name" | "slug">;
}

// "16 min" as an ISO 8601 duration, which is what schema.org's timeRequired takes.
function toDuration(readingTime?: string): string | undefined {
  const minutes = readingTime?.match(/(\d+)\s*min/i)?.[1];
  return minutes ? `PT${minutes}M` : undefined;
}

/**
 * schema.org BlogPosting for an article page, as plain data. Besides the usual
 * fields it carries what agents can't get from the rendered page: the
 * key-concepts deck (shown in a client-only modal) as the `abstract`, the
 * series the article belongs to, and a pointer to its markdown version.
 */
export function buildBlogPostingJsonLd({
  post,
  lang,
  slug,
  writer,
}: BlogPostingOptions) {
  const { metadata } = post;
  const [folder, fileSlug] = slug.split("/");
  const postUrl = `${SITE_URL}${withLocalePath(lang, `blog/${slug}`)}`;
  const imageUrl = metadata.thumbnail
    ? withSiteUrl(metadata.thumbnail)
    : withSiteUrl("/images/arkana-default-og.png");

  // Throws, failing the build, if the deck isn't the last block (like the page).
  const { deck } = splitKeyConcepts(post.content, metadata.title);
  const abstract = deck ? deckToPlainText(deck) : "";
  const timeRequired = toDuration(metadata.readingTime);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: metadata.title,
    description: metadata.description,
    ...(abstract && { abstract }),
    image: imageUrl,
    datePublished: metadata.date,
    author: {
      "@type": "Person",
      name: writer.name,
      url: `${SITE_URL}${withLocalePath(lang, `writers/${writer.slug}`)}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Arkana",
      logo: {
        "@type": "ImageObject",
        url: withSiteUrl("/logo.png"),
      },
    },
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    ...(folder && {
      isPartOf: {
        "@type": "CreativeWorkSeries",
        name: seriesName(folder),
      },
    }),
    ...(timeRequired && { timeRequired }),
    ...(folder &&
      fileSlug && {
        encoding: {
          "@type": "MediaObject",
          contentUrl: postMarkdownUrl(lang, folder, fileSlug),
          encodingFormat: "text/markdown",
        },
      }),
    keywords: metadata.tags.join(", "),
    inLanguage: lang,
  };
}
