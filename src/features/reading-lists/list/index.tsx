import { ReadingList } from "@/lib/reading-lists";
import { EmptyState } from "@/components/empty-state";
import { ReadingListCard } from "./components/reading-list-card";
import type { Dictionary } from "@/lib/dictionaries";

interface ReadingListsPageProps {
  dictionary: Dictionary;
  lang: string;
  readingLists: ReadingList[];
}

export function ReadingListsPage(props: ReadingListsPageProps) {
  const { lang, dictionary, readingLists } = props;

  return (
    <div className="container">
      <header className="brand-band mb-10 px-6 py-10 md:px-10 md:py-14">
        <h1 className="display-title !text-[clamp(2.5rem,5vw,4rem)] mb-4">
          {dictionary.readingLists.list.title}
        </h1>
        <p className="max-w-[60ch] text-lg text-ink-muted">
          {dictionary.readingLists.list.description}
        </p>
      </header>

      {readingLists.length === 0 && (
        <EmptyState
          title={dictionary.readingLists.list.noLists}
          description={dictionary.readingLists.list.noListsDescription}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {readingLists.map((list) => (
          <ReadingListCard
            key={list.id}
            list={list}
            lang={lang}
            dictionary={dictionary}
          />
        ))}
      </div>
    </div>
  );
}
