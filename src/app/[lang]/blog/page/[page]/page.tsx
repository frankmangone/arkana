import { Metadata } from "next";
import { MainLayout } from "@/components/layouts/main-layout";
import { BlogPage } from "@/features/blog/list";
import { getDictionary } from "@/lib/dictionaries";
import { getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";

const POSTS_PER_PAGE = 9; // 3x3 grid

interface BlogPageParams {
  lang: string;
  page: string;
}

interface BlogPageProps {
  params: BlogPageParams;
}

export const metadata: Metadata = {
  title: "Arkana | All Posts",
  description: "Articles on mathematics, computer science, and cryptography",
};

export async function generateStaticParams() {
  // Get all languages
  const allPosts = await getAllPosts("en"); // Use English as reference for total count
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  // Generate all possible language + page combinations
  const languages = ["en", "es", "pt"]; // Add all your supported languages
  const params = [];

  for (const lang of languages) {
    for (let page = 1; page <= totalPages; page++) {
      params.push({ lang, page: page.toString() });
    }
  }

  return params;
}

export default async function Page({ params }: BlogPageProps) {
  const { lang, page } = params;
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
