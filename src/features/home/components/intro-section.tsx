import type { Dictionary } from "@/lib/dictionaries";
import { GlyphRain } from "@/components/glyph-rain";
import { HeroSearch } from "./hero-search";

interface IntroSectionProps {
  lang: string;
  dictionary: Dictionary;
}

export function IntroSection({ lang, dictionary }: IntroSectionProps) {
  return (
    <section className="home-hero relative">
      {/* Static glyph field spans the full hero, fading out at both edges */}
      <div
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]"
        aria-hidden="true"
      >
        <GlyphRain animated={false} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[48vh] max-w-6xl items-center px-4 py-16 md:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl flex-1">
          <h1 className="display-title mb-8 !text-[clamp(2.75rem,6.75vw,5.25rem)] text-ink-on-brand-title">
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
