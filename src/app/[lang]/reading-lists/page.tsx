import { notFound } from "next/navigation";
import { getAllReadingLists } from "@/lib/reading-lists";
import { MainLayout } from "@/components/layouts/main-layout";
import { ReadingListsPage } from "@/features/reading-lists/list";
import { getDictionary } from "@/lib/dictionaries";

interface ReadingListsPageParams {
  lang: string;
}

interface ReadingListsPageProps {
  params: Promise<ReadingListsPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: ReadingListsPageProps) {
  const { lang } = await params;
  const localizedReadingLists = getAllReadingLists(lang);
  const dict = await getDictionary(lang);

  if (!localizedReadingLists) {
    return notFound();
  }

  return (
    <MainLayout lang={lang}>
      <ReadingListsPage
        lang={lang}
        dictionary={dict}
        readingLists={localizedReadingLists}
      />
    </MainLayout>
  );
}
