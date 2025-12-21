import { MainLayout } from "@/components/layouts/main-layout";
import { BlogPage } from "@/features/blog/list";
import { getDictionary } from "@/lib/dictionaries";
import { getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import { POSTS_PER_PAGE } from "./static-params";

interface BlogPageParams {
  lang: string;
  page: string;
}

interface BlogPageProps {
  params: Promise<BlogPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: BlogPageProps) {
  const { lang, page } = await params;
  const pageNumber = parseInt(page, 10);

  // Validate page number
  if (isNaN(pageNumber) || pageNumber < 1) {
    return notFound();
  }

  const dict = await getDictionary(lang);
  const allPosts = await getAllPosts(lang);

  // Calculate pagination values
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  // Validate page number against total pages
  if (pageNumber > totalPages) {
    return notFound();
  }

  // Get posts for current page
  const startIndex = (pageNumber - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  return (
    <MainLayout lang={lang}>
      <BlogPage
        lang={lang}
        posts={paginatedPosts}
        dictionary={dict}
        currentPage={pageNumber}
        totalPages={totalPages}
      />
    </MainLayout>
  );
}
