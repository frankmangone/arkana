import { getWriter } from "@/lib/writers";
import { MainLayout } from "@/components/layouts/main-layout";
import WriterPage from "@/features/writers/view";
import { getPostsByAuthor } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import { POSTS_PER_PAGE } from "./page/[page]/static-params";

interface WriterPageParams {
  lang: string;
  slug: string;
}

interface WriterPageProps {
  params: Promise<WriterPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: WriterPageProps) {
  const { lang, slug } = await params;

  const writer = await getWriter(slug);
  const dict = await getDictionary(lang);

  if (!writer) {
    notFound();
  }

  const allArticles = await getPostsByAuthor(slug, lang);
  const totalPages = Math.ceil(allArticles.length / POSTS_PER_PAGE);

  return (
    <MainLayout lang={lang}>
      <WriterPage
        lang={lang}
        writer={writer}
        articles={allArticles.slice(0, POSTS_PER_PAGE)}
        dictionary={dict}
        currentPage={1}
        totalPages={Math.max(1, totalPages)}
      />
    </MainLayout>
  );
}
