import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWriter, writers } from "@/lib/writers";
import { languages } from "@/lib/i18n-config";
import { MainLayout } from "@/components/layouts/main-layout";
import AuthorPage from "@/features/authors/view";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AuthorPageParams extends Promise<any> {
  lang: string;
  slug: string;
}

interface AuthorPageProps {
  params: AuthorPageParams;
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const author = await getWriter(params.slug);

  if (!author) {
    return {
      title: "Author Not Found",
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

  if (!writer) {
    notFound();
  }

  return (
    <MainLayout lang={lang}>
      <AuthorPage lang={lang} writer={writer} />
    </MainLayout>
  );
}
