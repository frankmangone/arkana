import { Writer } from "@/lib/writers";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <header className="full-bleed brand-hero mb-12">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 md:px-6 md:pb-20 lg:px-8">
          <Breadcrumbs
            lang={lang}
            items={[{ label: dictionary.writers.title }]}
            variant="onBrand"
            className="mb-12"
          />
          <h1 className="display-title !text-[clamp(2.75rem,6vw,4.75rem)] mb-5 text-ink-on-brand-title">
            {dictionary.writers.title}
          </h1>
          <p className="max-w-[60ch] text-xl text-ink-on-brand-soft">
            {dictionary.writers.description}
          </p>
        </div>
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
