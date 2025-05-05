import { ReadingList } from "@/lib/reading-lists";
import { EmptyState } from "@/components/empty-state";
import { ReadingListCard } from "./components/reading-list-card";

interface ReadingListsPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
  lang: string;
  readingLists: ReadingList[];
}

export function ReadingListsPage(props: ReadingListsPageProps) {
  const { lang, dictionary, readingLists } = props;

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8">
        {dictionary.readingLists.list.title}
      </h1>
      <p className="text-lg mb-10 text-gray-600 dark:text-gray-300">
        {dictionary.readingLists.list.description}
      </p>

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
