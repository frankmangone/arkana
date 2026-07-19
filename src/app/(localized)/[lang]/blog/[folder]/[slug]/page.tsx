import { PostPage } from "@/features/posts";
import { MainLayout } from "@/components/layouts/main-layout";

export { generateStaticParams } from "./static-params";
export { generateMetadata } from "./metadata";

export interface PageParams {
  lang: string;
  folder: string;
  slug: string;
}

export interface PageProps {
  params: Promise<PageParams>;
}

export default async function Page({ params }: PageProps) {
  const { lang, folder, slug } = await params;

  const fullSlug = `${folder}/${slug}`;

  return (
    <MainLayout lang={lang}>
      <PostPage lang={lang} slug={fullSlug} />
    </MainLayout>
  );
}
