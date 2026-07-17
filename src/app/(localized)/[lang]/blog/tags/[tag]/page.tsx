import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layouts/main-layout";
import { BlogPage } from "@/features/blog/list";
import { getDictionary } from "@/lib/dictionaries";
import { getAllPosts } from "@/lib/posts";
import { getTagDisplayName } from "@/lib/tags";

interface TagPageProps {
  params: Promise<{ lang: string; tag: string }>;
}

export { generateStaticParams } from "./static-params";
export { generateMetadata } from "./metadata";

export default async function Page({ params }: TagPageProps) {
  const { lang, tag } = await params;
  const allPosts = await getAllPosts(lang);
  const taggedPosts = allPosts.filter((post) => post.tags.includes(tag));

  if (taggedPosts.length === 0) {
    return notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <MainLayout lang={lang}>
      <BlogPage
        lang={lang}
        posts={taggedPosts}
        allPosts={allPosts}
        dictionary={dict}
        currentPage={1}
        totalPages={1}
        heading={getTagDisplayName(tag, lang)}
      />
    </MainLayout>
  );
}
