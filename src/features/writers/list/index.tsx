import { Writer } from "@/lib/writers";
import { EmptyState } from "@/components/empty-state";
import { WriterCard } from "./components/writer-card";

interface WritersPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
  lang: string;
  writers: Writer[];
}

export function WritersPage(props: WritersPageProps) {
  const { lang, dictionary, writers } = props;

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8">{dictionary.writers.title}</h1>
      <p className="text-lg mb-10 text-gray-600 dark:text-gray-300">
        {dictionary.writers.description}
      </p>

      {writers.length === 0 && (
        <EmptyState
          title={dictionary.writers.noWriters}
          description={dictionary.writers.noWritersDescription}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {writers.map((writer) => (
          <WriterCard
            key={writer.slug}
            writer={writer}
            lang={lang}
            dictionary={dictionary}
          />
        ))}
      </div>
    </div>
  );
}
