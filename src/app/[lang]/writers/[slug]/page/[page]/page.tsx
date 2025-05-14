import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWriter, writers } from "@/lib/writers";
import { languages } from "@/lib/i18n-config";
import { MainLayout } from "@/components/layouts/main-layout";
import WriterPage from "@/features/writers/view";
import { getPostsByAuthor } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";

const POSTS_PER_PAGE = 9; // 3x3 grid

interface WriterPageParams {
  lang: string;
  slug: string;
  page: string;
}

interface WriterPageProps {
  params: WriterPageParams;
}

export async function generateMetadata({
  params,
}: WriterPageProps): Promise<Metadata> {
  const { slug } = params;
  const author = await getWriter(slug);

  if (!author) {
    return {
      title: "Writer Not Found",
    };
  }

  return {
    title: `Arkana | ${author.name}`,
  };
}

export async function generateStaticParams() {
  const paths = [];

  for (const lang of languages) {
    for (const writerSlug of Object.keys(writers)) {
      // Get writer's posts to calculate total pages
      const posts = await getPostsByAuthor(writerSlug, lang);
      const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

      // Generate a path for each page
      for (let page = 1; page <= Math.max(1, totalPages); page++) {
        paths.push({
          slug: writerSlug,
          lang,
          page: page.toString(),
        });
      }
    }
  }

  return paths;
}

export default async function Page({ params }: WriterPageProps) {
  const { lang, slug, page } = params;
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

  // Validate page number against total pages
  if (pageNumber > totalPages) {
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
        totalPages={totalPages}
      />
    </MainLayout>
  );
}
