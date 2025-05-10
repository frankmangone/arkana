import Link from "next/link";

interface IntroSectionProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function IntroSection({ lang, dictionary }: IntroSectionProps) {
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col md:flex-row md:ml-[15%] md:w-[50%] overflow-hidden">
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 md:py-24 bg-transparent text-left md:text-left">
        <h1 className="text-4xl md:text-5xl mb-6 text-white">
          {dictionary.home.intro.descriptionBig}
        </h1>
        <p className="text-xl text-gray-300 mb-10">
          {dictionary.home.intro.descriptionSmall}
        </p>
        <div className="flex flex-col sm:flex-row justify-start gap-4 mt-12">
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
      </div>
    </section>
  );
}
