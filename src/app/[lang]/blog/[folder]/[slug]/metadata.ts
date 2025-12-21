import { Metadata } from "next";
import { PageProps } from "./page";
import { getPostBySlug } from "@/features/posts/actions";
import { generateBaseMetadata } from "@/lib/metadata-utils";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { folder, slug, lang } = await params;
  const fullSlug = `${folder}/${slug}`;
  const post = await getPostBySlug(fullSlug, lang);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }

  const image = post.metadata.thumbnail || "/images/arkana-default-og.png";

  return generateBaseMetadata({
    lang,
    path: `blog/${fullSlug}`,
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
