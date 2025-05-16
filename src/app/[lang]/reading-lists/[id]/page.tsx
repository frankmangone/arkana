import { ReadingListItem, readingLists } from "@/lib/reading-lists";
import { Metadata } from "next";
import { getPostBySlug } from "@/features/posts/actions";
import { MainLayout } from "@/components/layouts/main-layout";
import { ReadingListPage } from "@/features/reading-lists/view";
import { languages } from "@/lib/i18n-config";
import { NotFoundReadingList } from "@/components/not-found-reading-list";
import { PostPreview } from "@/lib/posts";
import { getWriter } from "@/lib/writers";
import { Post } from "@/lib/types";

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
    title: `Arkana | ${readingList.title}`,
    description: readingList.description,
  };
}

export async function generateStaticParams() {
  const paths = [];

  // Generate params only for reading lists that actually exist in each language
  for (const lang of languages) {
    try {
      const localizedReadingLists = readingLists[lang].getAllReadingLists();

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
  const readingList = readingLists[lang].getReadingList(id);

  if (!readingList) {
    return (
      <MainLayout lang={lang}>
        <NotFoundReadingList lang={lang} />
      </MainLayout>
    );
  }

  const posts: PostPreview[] = await Promise.all(
    (readingList.items as ReadingListItem[])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(async (item) => {
        const post = (await getPostBySlug(item.slug, lang)) as Post;
        const author = await getWriter(post.metadata.author);

        return {
          slug: item.slug,
          description: post.metadata.description ?? "",
          title: post.metadata.title,
          date: post.metadata.date,
          tags: post.metadata.tags,
          author: {
            name: author.name,
            slug: author.slug,
          },
          readingTime: post.metadata.readingTime,
          thumbnail: post.metadata.thumbnail,
        };
      })
  );

  return (
    <MainLayout lang={lang}>
      <ReadingListPage lang={lang} readingList={readingList} posts={posts} />
    </MainLayout>
  );
}
