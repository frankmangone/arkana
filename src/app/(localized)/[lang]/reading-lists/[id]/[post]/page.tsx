import { getPostFromReadingList } from "@/lib/reading-lists";
import { MainLayout } from "@/components/layouts/main-layout";
import { NotFoundReadingList } from "@/components/not-found-reading-list";
import { ReadingListPostPage } from "@/features/reading-lists/post";
import { getPostBySlug } from "@/features/posts/actions";

interface ReadingListPostPageParams {
  lang: string;
  id: string;
  post: string;
}

export interface ReadingListPostPageProps {
  params: Promise<ReadingListPostPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: ReadingListPostPageProps) {
  const { lang, id, post: postId } = await params;
  const postFromReadingList = getPostFromReadingList({ lang, id, postId });

  if (!postFromReadingList) {
    return (
      <MainLayout lang={lang}>
        <NotFoundReadingList lang={lang} />
      </MainLayout>
    );
  }

  const slug = postFromReadingList.slug;
  const post = await getPostBySlug(slug, lang);

  if (!post) {
    return (
      <MainLayout lang={lang}>
        <NotFoundReadingList lang={lang} />
      </MainLayout>
    );
  }

  return (
    <MainLayout lang={lang}>
      <ReadingListPostPage lang={lang} id={id} slug={slug} post={post} />
    </MainLayout>
  );
}
