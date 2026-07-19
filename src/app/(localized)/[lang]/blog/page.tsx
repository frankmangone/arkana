import { MainLayout } from "@/components/layouts/main-layout";
import { BlogPage } from "@/features/blog/list";
import { getDictionary } from "@/lib/dictionaries";
import { getAllPosts } from "@/lib/posts";
import { POSTS_PER_PAGE } from "./page/[page]/static-params";

interface PageProps {
  params: Promise<PageParams>;
}

export interface PageParams {
  lang: string;
}

export { generateStaticParams } from "./static-params";
export { generateMetadata } from "./metadata";

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const allPosts = await getAllPosts(lang);

  return (
    <MainLayout lang={lang}>
      <BlogPage
        lang={lang}
        posts={allPosts.slice(0, POSTS_PER_PAGE)}
        allPosts={allPosts}
        dictionary={dict}
        startIndex={0}
      />
    </MainLayout>
  );
}
