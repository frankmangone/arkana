import Link from "next/link";
import { DecoderSigil } from "@/components/decoder-sigil";
import type { Dictionary } from "@/lib/dictionaries";

interface SurveyPageProps {
  dictionary: Dictionary;
}

export function SurveyPage({ dictionary }: SurveyPageProps) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 py-16 text-center md:py-24">
      <div className="w-48 md:w-56">
        <DecoderSigil content={dictionary.home.userSurvey.title} />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-ink-heading md:text-4xl">
        {dictionary.home.userSurvey.title}
      </h1>
      <p className="max-w-[60ch] text-lg text-ink-muted">
        {dictionary.home.userSurvey.description}
      </p>
      <Link
        href="https://forms.gle/NLk49eNnu6jTwGMt8"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center rounded-[4px] bg-[image:var(--grad-brand)] px-7 py-3 font-medium text-white transition-[filter] hover:brightness-110"
      >
        {dictionary.home.userSurvey.button}
      </Link>
    </section>
  );
}
