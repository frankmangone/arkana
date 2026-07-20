import { ReadingList } from "@/lib/reading-lists";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { getPostsFromReadingList } from "../view/fetch";
import { ReadingListCard } from "./components/reading-list-card";
import { formatReadingTime, sumReadingTimeMinutes } from "../reading-time";
import type { Dictionary } from "@/lib/dictionaries";

interface ReadingListsPageProps {
  dictionary: Dictionary;
  lang: string;
  readingLists: ReadingList[];
}

export async function ReadingListsPage(props: ReadingListsPageProps) {
  const { lang, dictionary, readingLists } = props;

  // Total reading time per list, summed from each article's reading time
  const totalReadingTimes = await Promise.all(
    readingLists.map(async (list) => {
      const posts = await getPostsFromReadingList({ readingList: list, lang });
      return formatReadingTime(sumReadingTimeMinutes(posts));
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {readingLists.map((list, index) => (
          <ReadingListCard
            key={list.id}
            list={list}
            lang={lang}
            dictionary={dictionary}
            moduleCount={list.modules.length}
            totalReadingTime={totalReadingTimes[index]}
          />
        ))}
      </div>
    </div>
  );
}
