import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DecoderSigil } from "@/components/decoder-sigil";
import { GlyphRain } from "@/components/glyph-rain";
import type { Dictionary } from "@/lib/dictionaries";

interface SurveyPageProps {
  dictionary: Dictionary;
}

export function SurveyPage({ dictionary }: SurveyPageProps) {
  return (
    <div className="full-bleed home-hero relative">
      <div
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]"
        aria-hidden="true"
      >
        <GlyphRain animated={false} />
      </div>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-16 text-center md:py-24">
        {/* Sequential row: glyphs lock left-to-right, "building" the
            fingerprint one at a time — fits the survey's building-Arkana
            theme, unlike the shuffled 4x4 grid used elsewhere. */}
        <DecoderSigil
          content={dictionary.home.userSurvey.title}
          layout="row"
          glyphCount={8}
          sequential
          idleFlicker={false}
          lineColor="#ffffff"
        />
        <h1 className="text-3xl font-semibold tracking-tight text-ink-on-brand-title md:text-4xl">
          {dictionary.home.userSurvey.title}
        </h1>
        <p className="max-w-[60ch] text-lg text-ink-on-brand-soft">
          {dictionary.home.userSurvey.description}
        </p>
        <Link
          href="https://forms.gle/NLk49eNnu6jTwGMt8"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-[4px] border border-ink-on-brand/40 px-4 py-2.5 text-sm font-medium text-ink-on-brand transition-colors hover:border-ink-on-brand/70 hover:bg-white/10"
        >
          <ExternalLink className="h-4 w-4" />
          {dictionary.home.userSurvey.button}
        </Link>
      </section>
    </div>
  );
}
