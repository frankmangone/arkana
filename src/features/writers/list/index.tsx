import { Writer } from "@/lib/writers";
import { EmptyState } from "@/components/empty-state";
import { WriterCard } from "./components/writer-card";
import type { Dictionary } from "@/lib/dictionaries";

interface WritersPageProps {
  dictionary: Dictionary;
  lang: string;
  writers: Writer[];
}

export function WritersPage(props: WritersPageProps) {
  const { lang, dictionary, writers } = props;

  return (
    <div className="container">
      <header className="mb-10 border-b border-rule pb-6">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-ink-heading md:text-5xl">
          {dictionary.writers.title}
        </h1>
        <p className="max-w-[60ch] text-lg text-ink-muted">
          {dictionary.writers.description}
        </p>
      </header>

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
