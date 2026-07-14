import React from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";

interface UserSurveyProps {
  dictionary: Dictionary;
}

export function UserSurvey({ dictionary }: UserSurveyProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <div className="flex flex-col items-center gap-5 rounded-md border border-rule px-6 py-14 text-center md:px-16">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-heading md:text-3xl">
          {dictionary.home.userSurvey.title}
        </h2>
        <p className="max-w-[60ch] text-ink-muted">
          {dictionary.home.userSurvey.description}
        </p>
        <Link
          href="https://forms.gle/NLk49eNnu6jTwGMt8"
          className="mt-3 inline-flex items-center rounded-[4px] bg-primary-700 px-6 py-2.5 font-medium text-[#161226] transition-colors hover:bg-primary-750"
        >
          {dictionary.home.userSurvey.button}
        </Link>
      </div>
    </section>
  );
}
