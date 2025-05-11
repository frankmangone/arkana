import Link from "next/link";
import Image from "next/image";

interface IntroSectionProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function IntroSection({ lang, dictionary }: IntroSectionProps) {
  return (
    <section className="relative w-full min-h-[50vh] flex flex-col md:min-h-[70vh] md:flex-row mx-auto overflow-hidden items-center">
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-6 md:py-12 md:py-24 bg-transparent text-left w-full md:max-w-[50%] md:text-left">
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

      <div className="flex-1 flex items-center justify-center hidden lg:block">
        <Image
          src="/3d-logo.png"
          alt="Arkana 3D Logo"
          width={500}
          height={500}
          className="w-full max-w-full h-auto drop-shadow-2xl"
          priority
        />
      </div>
    </section>
  );
}
