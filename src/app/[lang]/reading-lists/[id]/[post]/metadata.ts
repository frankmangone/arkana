import { Metadata } from "next";
import { getPostBySlug } from "@/features/posts/actions";
import { ReadingListPostPageProps } from "./page";
import { getPostFromReadingList } from "@/lib/reading-lists";
import { generateBaseMetadata } from "@/lib/metadata-utils";

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

  const image = post.metadata.thumbnail || "/images/arkana-default-og.png";

  return generateBaseMetadata({
    lang,
    path: `reading-lists/${id}/${postId}`,
    title: `Arkana | ${post.metadata.title}`,
    description: post.metadata.description!,
    image,
    ogTitle: post.metadata.title,
    siteName: "Arkana Blog",
    type: "article",
    publishedTime: post.metadata.date,
    authors: [post.metadata.author],
    tags: post.metadata.tags,
    keywords: post.metadata.tags,
  });
}

