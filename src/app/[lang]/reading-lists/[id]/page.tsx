import { getAllReadingLists, getReadingList } from "@/lib/reading-lists";
import { Metadata } from "next";
import { MainLayout } from "@/components/layouts/main-layout";
import { ReadingListPage } from "@/features/reading-lists/view";
import { languages } from "@/lib/i18n-config";
import { NotFoundReadingList } from "@/components/not-found-reading-list";

interface ReadingListPageParams {
  lang: string;
  id: string;
}

interface ReadingListPageProps {
  params: Promise<ReadingListPageParams>;
}

export async function generateMetadata({
  params,
}: ReadingListPageProps): Promise<Metadata> {
  const { id, lang } = await params;
  const readingList = getReadingList({ lang, id });

  if (!readingList) {
    return {
      title: "Reading List Not Found",
      description: "The requested reading list could not be found.",
    };
  }

  return {
    title: `Arkana | ${readingList.title}`,
    description: readingList.description,
  };
}

export async function generateStaticParams() {
  const paths = [];

  // Generate params only for reading lists that actually exist in each language
  for (const lang of languages) {
    try {
      const localizedReadingLists = getAllReadingLists(lang);

      // Only generate paths for reading lists that exist in this language
      for (const list of localizedReadingLists) {
        paths.push({
          id: list.id,
          lang,
        });
      }
    } catch (error) {
      console.error(`Error getting reading lists for language ${lang}:`, error);
    }
  }

  return paths;
}

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
