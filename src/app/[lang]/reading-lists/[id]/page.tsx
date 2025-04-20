import { ReadingListItem, readingLists } from "@/lib/reading-lists";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPostBySlug } from "@/features/posts/actions";
import { MainLayout } from "@/components/layouts/main-layout";
import { ReadingListPage } from "@/features/reading-lists/view";
import { languages } from "@/lib/i18n-config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ReadingListPageParams extends Promise<any> {
  lang: string;
  id: string;
}

interface ReadingListPageProps {
  params: ReadingListPageParams;
}

export async function generateMetadata({
  params,
}: ReadingListPageProps): Promise<Metadata> {
  const { id, lang } = await params;
  const readingList = readingLists[lang].getReadingList(id);

  if (!readingList) {
    return {
      title: "Reading List Not Found",
      description: "The requested reading list could not be found.",
    };
  }

  return {
    title: `${readingList.title} - Reading List`,
    description: readingList.description,
  };
}

export async function generateStaticParams() {
  const paths = [];

  for (const lang of languages) {
    const localizedReadingLists = readingLists[lang].getAllReadingLists();

    for (const list of localizedReadingLists) {
      paths.push({
        id: list.id,
        lang,
      });
    }
  }

  return paths;
}

export default async function Page({ params }: ReadingListPageProps) {
  const { lang, id } = await params;
  const readingList = readingLists[lang].getReadingList(id);

  if (!readingList) {
    notFound();
  }

  // Fetch post data for each item in the reading list
  const posts = await Promise.all(
    (readingList.items as ReadingListItem[])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(async (item) => {
        const post = await getPostBySlug(item.slug, lang);
        return {
          ...item,
          post,
        };
      })
  );

  return (
    <MainLayout lang={lang}>
      <ReadingListPage lang={lang} readingList={readingList} posts={posts} />
    </MainLayout>
  );
}
