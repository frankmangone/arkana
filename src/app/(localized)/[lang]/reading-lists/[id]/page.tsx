import { getReadingList } from "@/lib/reading-lists";
import { MainLayout } from "@/components/layouts/main-layout";
import { ReadingListPage } from "@/features/reading-lists/view";
import { NotFoundReadingList } from "@/components/not-found-reading-list";

interface ReadingListPageParams {
  lang: string;
  id: string;
}

interface ReadingListPageProps {
  params: Promise<ReadingListPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: ReadingListPageProps) {
  const { lang, id } = await params;
  const readingList = getReadingList({ lang, id });

  if (!readingList) {
    return (
      <MainLayout lang={lang}>
        <NotFoundReadingList lang={lang} />
      </MainLayout>
    );
  }

  return (
    <MainLayout lang={lang}>
      <ReadingListPage lang={lang} readingList={readingList} />
    </MainLayout>
  );
}
