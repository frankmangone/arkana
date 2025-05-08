import Link from "next/link";

interface IntroSectionProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function IntroSection({ lang, dictionary }: IntroSectionProps) {
  return (
    <section className="text-center max-w-4xl mx-auto py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        {dictionary.home.intro.title}
      </h1>

      <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
        {dictionary.home.intro.description}
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href={`/${lang}/writers`}
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-lg transition-colors hover:bg-[rgba(167,119,255,0.2)]"
        >
          {dictionary.home.intro.meetWriters}
        </Link>

        <Link
          href={`/${lang}/reading-lists`}
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-lg transition-colors hover:bg-[rgba(167,119,255,0.2)]"
        >
          {dictionary.home.intro.exploreReadingLists}
        </Link>
      </div>
    </section>
  );
}
