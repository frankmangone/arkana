import { ReadingListItem, readingLists } from "@/lib/reading-lists";
import { Metadata } from "next";
import { getPostBySlug } from "@/features/posts/actions";
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
  const readingList = readingLists[lang].getReadingList(id);

  if (!readingList) {
    return {
      title: "Reading List Not Found",
      description: "The requested reading list could not be found.",
    };
  }

  return {
    title: `Mindō | ${readingList.title}`,
    description: readingList.description,
  };
}

export async function generateStaticParams() {
  const paths = [];
  // Track all unique reading list IDs
  const allReadingListIds = new Set<string>();

  // First collect all unique reading list IDs across all languages
  for (const lang of languages) {
    try {
      const localizedReadingLists = readingLists[lang].getAllReadingLists();

      for (const list of localizedReadingLists) {
        allReadingListIds.add(list.id);
      }
    } catch (error) {
      console.error(`Error getting reading lists for language ${lang}:`, error);
    }
  }

  // Generate params for all languages and all reading list IDs
  for (const lang of languages) {
    for (const id of allReadingListIds) {
      paths.push({
        id,
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
    return (
      <MainLayout lang={lang}>
        <NotFoundReadingList lang={lang} />
      </MainLayout>
    );
  }

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
