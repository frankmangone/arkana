import { notFound } from "next/navigation";
import { getWriter } from "@/lib/writers";
import { MainLayout } from "@/components/layouts/main-layout";
import WriterPage from "@/features/writers/view";
import { getPostsByAuthor } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import { POSTS_PER_PAGE } from "./static-params";

interface WriterPageParams {
  lang: string;
  slug: string;
  page: string;
}

interface WriterPageProps {
  params: Promise<WriterPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: WriterPageProps) {
  const { lang, slug, page } = await params;
  const pageNumber = parseInt(page, 10);

  // Validate page number
  if (isNaN(pageNumber) || pageNumber < 1) {
    return notFound();
  }

  const writer = await getWriter(slug);
  const dict = await getDictionary(lang);

  if (!writer) {
    notFound();
  }

  const allArticles = await getPostsByAuthor(slug, lang);

  // Calculate pagination values
  const totalPages = Math.ceil(allArticles.length / POSTS_PER_PAGE);

  // Only return 404 if we're trying to access a page beyond page 1 when there are no articles
  if (pageNumber > 1 && allArticles.length === 0) {
    return notFound();
  }

  // Get posts for current page
  const startIndex = (pageNumber - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedArticles = allArticles.slice(startIndex, endIndex);

  return (
    <MainLayout lang={lang}>
      <WriterPage
        lang={lang}
        writer={writer}
        articles={paginatedArticles}
        dictionary={dict}
        currentPage={pageNumber}
        totalPages={Math.max(1, totalPages)}
      />
    </MainLayout>
  );
}
