import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";

interface UserSurveyProps {
  dictionary: Dictionary;
}

export function UserSurvey({ dictionary }: UserSurveyProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <div className="brand-band flex flex-col items-center gap-10 overflow-hidden px-6 py-14 md:flex-row md:px-14 md:py-16">
        <div className="w-52 shrink-0 md:w-64">
          <Image
            src="/solo.png"
            alt=""
            width={400}
            height={400}
            className="h-auto w-full select-none object-contain mix-blend-lighten"
            aria-hidden="true"
          />
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
