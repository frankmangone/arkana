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
      <header className="brand-band mb-10 px-6 py-10 md:px-10 md:py-14">
        <h1 className="display-title !text-[clamp(2.5rem,5vw,4rem)] mb-4">
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
