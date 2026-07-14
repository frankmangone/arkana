import type { Dictionary } from "@/lib/dictionaries";
import { ArkanaStrip } from "@/components/arkana-strip";
import { HeroSearch } from "./hero-search";

interface IntroSectionProps {
  lang: string;
  dictionary: Dictionary;
}

// Stable seed so the hero glyph field is identical on every render
const HERO_STRIP_SEED = BigInt(
  "0x43fae4b79cea8041f4fa7b43a777ff5423b043fae4b79cea8041f4fa7b43a777"
);

export function IntroSection({ lang, dictionary }: IntroSectionProps) {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center gap-16 px-4 py-20 md:px-6 md:py-28 lg:px-8">
        <div className="max-w-2xl flex-1">
          <p className="eyebrow mb-6 text-primary-800">
            {dictionary.home.intro.title}
          </p>
          <h1 className="display-title mb-6">
            {dictionary.home.intro.descriptionBig}
          </h1>
          <p className="mb-10 max-w-[45ch] text-lg leading-relaxed text-ink-muted">
            {dictionary.home.intro.descriptionSmall}
          </p>
          <HeroSearch lang={lang} dictionary={dictionary} />
        </div>

        {/* Glyph field — constrained width wraps the 16-glyph strip into a 4×4 grid */}
        <div
          className="hidden w-[200px] shrink-0 opacity-50 lg:block"
          aria-hidden="true"
        >
          <ArkanaStrip randomSeed={HERO_STRIP_SEED} />
        </div>
      </div>
    </section>
  );
}
