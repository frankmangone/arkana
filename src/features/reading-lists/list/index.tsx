import { ReadingList } from "@/lib/reading-lists";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <header className="full-bleed brand-hero mb-12">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 md:px-6 md:pb-20 lg:px-8">
          <Breadcrumbs
            lang={lang}
            items={[{ label: dictionary.readingLists.list.title }]}
            variant="onBrand"
            className="mb-12"
          />
          <h1 className="display-title !text-[clamp(2.75rem,6vw,4.75rem)] mb-5 text-ink-on-brand-title">
            {dictionary.readingLists.list.title}
          </h1>
          <p className="max-w-[60ch] text-xl text-ink-on-brand-soft">
            {dictionary.readingLists.list.description}
          </p>
        </div>
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
