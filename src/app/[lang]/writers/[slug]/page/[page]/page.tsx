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
  params: Promise<WriterPageParams>;
}

export async function generateMetadata({
  params,
}: WriterPageProps): Promise<Metadata> {
  const { slug } = await params;
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
      // Always generate at least page 1 for every writer in every language
      paths.push({
        slug: writerSlug,
        lang,
        page: "1",
      });

      // Get writer's posts to calculate total pages
      const posts = await getPostsByAuthor(writerSlug, lang);
      const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

      // Generate additional pages if there are more posts
      for (let page = 2; page <= totalPages; page++) {
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
