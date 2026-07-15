import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { withLocalePath } from "@/lib/site-config";
import type { Dictionary } from "@/lib/dictionaries";

interface ReadingListsProps {
  lang: string;
  dictionary: Dictionary;
}

export function ReadingLists({ lang, dictionary }: ReadingListsProps) {
  return (
    <section className="border-y border-rule bg-[image:var(--grad-band)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-center md:px-6 md:py-20 lg:px-8">
        <BookOpen
          className="hidden h-10 w-10 shrink-0 text-primary-700 lg:block"
          aria-hidden="true"
        />
        <div className="flex-1">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink-heading md:text-3xl">
            {dictionary.home.readingLists.title}
          </h2>
          <p className="max-w-[60ch] text-ink-muted">
            {dictionary.home.readingLists.description}
          </p>
        </div>
        <Link
          href={withLocalePath(lang, "reading-lists")}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary-800 transition-colors hover:text-primary-900"
        >
          {dictionary.home.readingLists.viewAll}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
