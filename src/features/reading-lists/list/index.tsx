import { ReadingList } from "@/lib/reading-lists";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { getPostsFromReadingList } from "../view/fetch";
import { ReadingListCard } from "./components/reading-list-card";
import type { Dictionary } from "@/lib/dictionaries";

interface ReadingListsPageProps {
  dictionary: Dictionary;
  lang: string;
  readingLists: ReadingList[];
}

export async function ReadingListsPage(props: ReadingListsPageProps) {
  const { lang, dictionary, readingLists } = props;

  // First article titles per list, so cards can preview their contents
  const previews = await Promise.all(
    readingLists.map(async (list) => {
      const posts = await getPostsFromReadingList({ readingList: list, lang });
      return posts.slice(0, 4).map((post) => post.title);
    })
  );

  return (
    <div className="container">
      <header className="mb-12 pb-10 pt-8">
        <Breadcrumbs
          lang={lang}
          items={[{ label: dictionary.readingLists.list.title }]}
          className="mb-12"
        />
        <h1 className="display-title !text-[clamp(2.25rem,5vw,3.75rem)] mb-5 text-primary-750">
          {dictionary.readingLists.list.title}
        </h1>
        <p className="max-w-[60ch] text-xl text-ink-muted">
          {dictionary.readingLists.list.description}
        </p>
      </header>

      {readingLists.length === 0 && (
        <EmptyState
          title={dictionary.readingLists.list.noLists}
          description={dictionary.readingLists.list.noListsDescription}
        />
      )}

      <div className="flex flex-col gap-8">
        {readingLists.map((list, index) => (
          <ReadingListCard
            key={list.id}
            list={list}
            lang={lang}
            dictionary={dictionary}
            previewTitles={previews[index]}
          />
        ))}
      </div>
    </div>
  );
}
