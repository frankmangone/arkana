import Link from "next/link";

interface IntroSectionProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function IntroSection({ lang, dictionary }: IntroSectionProps) {
  return (
    <section className="w-full min-h-[50vh] flex flex-col md:min-h-[70vh] md:flex-row mx-auto items-center">
      <div className="z-10 flex-1 flex flex-col justify-center px-6 py-6 md:py-12 md:py-24 bg-transparent text-left w-full md:max-w-6/10 md:text-left xl:max-w-4/10">
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
