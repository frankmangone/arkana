import type { Dictionary } from "@/lib/dictionaries";
import { GlyphRain } from "@/components/glyph-rain";
import { HeroSearch } from "./hero-search";

interface IntroSectionProps {
  lang: string;
  dictionary: Dictionary;
}

export function IntroSection({ lang, dictionary }: IntroSectionProps) {
  return (
    <section className="brand-hero relative">
      {/* Matrix-style glyph rain across the right side */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] lg:block [mask-image:linear-gradient(to_left,black_55%,transparent)]"
        aria-hidden="true"
      >
        <GlyphRain />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-6xl items-center px-4 py-24 md:px-6 md:py-32 lg:px-8">
        <div className="max-w-3xl flex-1">
          <h1 className="display-title mb-8 !text-[clamp(3rem,7.5vw,6rem)] text-ink-on-brand-title">
            {dictionary.home.intro.descriptionBig}
          </h1>
          <p className="mb-12 max-w-[44ch] text-xl leading-relaxed text-ink-on-brand-soft md:text-2xl">
            {dictionary.home.intro.descriptionSmall}
          </p>
          <HeroSearch lang={lang} dictionary={dictionary} />
        </div>
      </div>
    </section>
  );
}
