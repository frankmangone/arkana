import React from "react";
import Link from "next/link";
import { DecoderSigil } from "@/components/decoder-sigil";
import type { Dictionary } from "@/lib/dictionaries";

interface UserSurveyProps {
  dictionary: Dictionary;
}

export function UserSurvey({ dictionary }: UserSurveyProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
        <div className="w-52 shrink-0 md:w-64">
          <DecoderSigil content={dictionary.home.userSurvey.title} />
        </div>
        <div className="flex flex-1 flex-col items-center gap-5 text-center md:items-start md:text-left">
          <h2 className="text-3xl font-semibold tracking-tight text-ink-heading md:text-4xl">
            {dictionary.home.userSurvey.title}
          </h2>
          <p className="max-w-[60ch] text-lg text-ink-muted">
            {dictionary.home.userSurvey.description}
          </p>
          <Link
            href="https://forms.gle/NLk49eNnu6jTwGMt8"
            className="mt-3 inline-flex items-center rounded-[4px] bg-[image:var(--grad-brand)] px-7 py-3 font-medium text-white transition-[filter] hover:brightness-110"
          >
            {dictionary.home.userSurvey.button}
          </Link>
        </div>
      </div>
    </section>
  );
}
