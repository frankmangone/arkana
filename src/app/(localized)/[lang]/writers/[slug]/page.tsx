import { getWriter } from "@/lib/writers";
import { MainLayout } from "@/components/layouts/main-layout";
import WriterPage from "@/features/writers/view";
import { getPostsByAuthor } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";

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

  const articles = await getPostsByAuthor(slug, lang);

  return (
    <MainLayout lang={lang}>
      <WriterPage lang={lang} writer={writer} articles={articles} dictionary={dict} />
    </MainLayout>
  );
}
