// import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import { PostContent } from "./components/content";
import { getPostBySlug } from "./actions";
import { PostHeader } from "./components/header";

interface PostPageProps {
  lang: string;
  slug: string;
}

export default async function PostPage(props: PostPageProps) {
  const { lang, slug } = props;

  // const dict = await getDictionary(lang);
  const post = await getPostBySlug(slug, lang);

  if (!post) {
    notFound();
  }

  return (
    <article className="container py-8 max-w-3xl mx-auto">
      <PostHeader post={post} lang={lang} />
      <PostContent post={post} />
      {/* <PostFooter post={post} lang={lang} dictionary={dict} /> */}
      {/* <RelatedPosts
        tags={post.tags}
        currentPostId={post.id}
        lang={lang}
        dictionary={dict}
      /> */}
    </article>
  );
}
