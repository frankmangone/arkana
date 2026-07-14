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
      <header className="mb-10 border-b border-rule pb-6">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-ink-heading md:text-5xl">
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
