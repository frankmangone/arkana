import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWriter, writers } from "@/lib/writers";
import { languages } from "@/lib/i18n-config";
import { MainLayout } from "@/components/layouts/main-layout";
import WriterPage from "@/features/writers/view";
import { getPostsByAuthor } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";

interface AuthorPageParams {
  lang: string;
  slug: string;
}

interface AuthorPageProps {
  params: Promise<AuthorPageParams>;
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getWriter(slug);

  if (!author) {
    return {
      title: "Writer Not Found",
    };
  }

  return {
    title: author.name,
  };
}

export async function generateStaticParams() {
  const paths = [];

  for (const lang of languages) {
    for (const writerSlug of Object.keys(writers)) {
      paths.push({
        slug: writerSlug,
        lang,
      });
    }
  }

  return paths;
}

export default async function Page({ params }: AuthorPageProps) {
  const { lang, slug } = await params;
  const writer = await getWriter(slug);
  const dict = await getDictionary(lang);

  if (!writer) {
    notFound();
  }

  const articles = await getPostsByAuthor(slug, lang);

  return (
    <MainLayout lang={lang}>
      <WriterPage
        lang={lang}
        writer={writer}
        articles={articles}
        dictionary={dict}
      />
    </MainLayout>
  );
}
