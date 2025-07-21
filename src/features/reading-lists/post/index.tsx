import { PostContent } from "@/components/custom/post-content";
import { PostHeader } from "@/components/custom/post-header";
import { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";
import { getReadingList } from "@/lib/reading-lists";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

interface ReadingListPostPageProps {
  lang: string;
  id: string;
  slug: string;
  post: Post;
}

export async function ReadingListPostPage(props: ReadingListPostPageProps) {
  const { lang, id, slug, post } = props;

  // Get the writer information
  const writer = getWriter(post.metadata.author);

  // Get the PostHeader component and await it
  const header = await PostHeader({ post, lang });

  // Base URL for absolute links
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.blog";
  const postUrl = `${baseUrl}/${lang}/blog/${slug}`;
  const imageUrl = post.metadata.thumbnail
    ? `${baseUrl}${post.metadata.thumbnail}`
    : `${baseUrl}/images/arkana-default-og.png`;

  // Get reading list data for navigation
  const readingList = getReadingList({ lang, id });
  const currentIndex =
    readingList?.items.findIndex((item) => item.slug === slug) ?? -1;
  const prevItem =
    currentIndex > 0 ? readingList?.items[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < (readingList?.items.length ?? 0) - 1
      ? readingList?.items[currentIndex + 1]
      : null;

  // Create structured data for the article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    description: post.metadata.description,
    image: imageUrl,
    datePublished: post.metadata.date,
    author: {
      "@type": "Person",
      name: writer.name,
      url: `${baseUrl}/${lang}/writers/${writer.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Arkana",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/logo.png`,
      },
    },
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    keywords: post.metadata.tags.join(", "),
    inLanguage: lang,
  };

  return (
    <article className="container py-8 max-w-3xl mx-auto">
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {header}
      <PostContent post={post} />

      {/* Navigation */}
      {(prevItem || nextItem) && (
        <div className="flex gap-4 justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          {prevItem ? (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex h-28 basis-[240px] justify-between items-start gap-2 border-gray-300 dark:border-gray-600"
            >
              <Link
                href={`/${lang}/reading-lists/${id}/${prevItem.id}`}
                className="flex flex-col w-full justify-between items-start py-4"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ArrowLeft size={16} className="shrink-0" />
                  <span>Previous</span>
                </div>
                <div className="text-primary-400 dark:text-primary-400 font-medium line-clamp-2 break-word whitespace-normal">
                  {prevItem.id
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </Link>
            </Button>
          ) : (
            <div className="basis-[240px]" />
          )}

          {nextItem ? (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex h-28 basis-[240px] justify-between items-end gap-2 border-gray-300 dark:border-gray-600"
            >
              <Link
                href={`/${lang}/reading-lists/${id}/${nextItem.id}`}
                className="flex flex-col w-full justify-between items-end py-4"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 w-full justify-end">
                  <span>Next</span>
                  <ArrowRight size={16} className="shrink-0" />
                </div>
                <div className="text-primary-400 dark:text-primary-400 font-medium line-clamp-2 break-word whitespace-normal text-right">
                  {nextItem.id
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </Link>
            </Button>
          ) : (
            <div className="basis-[240px]" />
          )}
        </div>
      )}
    </article>
  );
}
