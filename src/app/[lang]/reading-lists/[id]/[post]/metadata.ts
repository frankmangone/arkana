import { Metadata } from "next";
import { getPostBySlug } from "@/features/posts/actions";
import { ReadingListPostPageProps } from "./page";
import { getPostFromReadingList } from "@/lib/reading-lists";

export async function generateMetadata({
  params,
}: ReadingListPostPageProps): Promise<Metadata> {
  const { lang, id, post: postId } = await params;
  const postFromReadingList = getPostFromReadingList({
    lang,
    id,
    postId,
  });

  if (!postFromReadingList) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }

  const post = await getPostBySlug(postFromReadingList.slug, lang);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }

  // Base URL for absolute links
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.blog";
  const canonicalUrl = `${baseUrl}/${lang}/reading-lists/${id}/${postFromReadingList.slug}`;
  const imageUrl = post.metadata.thumbnail
    ? `${baseUrl}${post.metadata.thumbnail}`
    : `${baseUrl}/images/arkana-default-og.png`;

  return {
    title: `Arkana | ${post.metadata.title}`,
    description: post.metadata.description,
    authors: [{ name: post.metadata.author }],
    keywords: post.metadata.tags,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/reading-lists/${id}/${postId}`,
        es: `${baseUrl}/es/reading-lists/${id}/${postId}`,
        pt: `${baseUrl}/pt/reading-lists/${id}/${postId}`,
      },
    },
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description || "",
      url: canonicalUrl,
      siteName: "Arkana Blog",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.metadata.title,
        },
      ],
      locale: lang,
      type: "article",
      publishedTime: post.metadata.date,
      authors: [post.metadata.author],
      tags: post.metadata.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.description || "",
      images: [imageUrl],
    },
  };
}
