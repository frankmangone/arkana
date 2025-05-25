import Link from "next/link";

interface IntroSectionProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function IntroSection({ lang, dictionary }: IntroSectionProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";

  return (
    <section className="w-full min-h-[50vh] flex flex-col md:min-h-[65vh] md:flex-row items-center md:pt-12">
      <div className="container z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-8xl">
        <div className="z-10 flex-1 flex flex-col justify-center py-6 md:py-12 bg-transparent text-left w-full md:max-w-6/10 md:text-left xl:max-w-4/10">
          <h1 className="text-4xl md:text-5xl mb-6 mr-2 text-white">
            {dictionary.home.intro.descriptionBig}
          </h1>
          <p className="text-xl text-gray-300 mb-10">
            {dictionary.home.intro.descriptionSmall}
          </p>
          <div className="flex flex-col sm:flex-row justify-start gap-4 mt-12">
            <Link
              href={`${baseUrl}/${lang}/writers`}
              className="inline-flex items-center justify-center px-6 py-3 text-white transition-colors bg-primary-500 hover:bg-primary-600"
            >
              {dictionary.home.intro.meetWriters}
            </Link>
            <Link
              href={`${baseUrl}/${lang}/reading-lists`}
              className="inline-flex items-center justify-center px-6 py-3 text-white transition-colors bg-primary-500 hover:bg-primary-600"
            >
              {dictionary.home.intro.exploreReadingLists}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
