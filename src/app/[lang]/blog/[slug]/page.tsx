import PostPage from "@/features/posts";
import { getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";

interface PostPageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug, params.lang);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function Post(props: PostPageProps) {
  const { lang, slug } = await props.params;

  return <PostPage lang={lang} slug={slug} />;
}
