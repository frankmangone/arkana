import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { withLocalePath, withSiteUrl } from "@/lib/site-config";
import { getAllReadingLists } from "@/lib/reading-lists";
import type { Dictionary } from "@/lib/dictionaries";

interface ReadingListsProps {
  lang: string;
  dictionary: Dictionary;
}

export function ReadingLists({ lang, dictionary }: ReadingListsProps) {
  const covers = getAllReadingLists(lang)
    .filter((list) => list.coverImage)
    .slice(0, 4);

  return (
    <section className="border-y border-rule bg-[image:var(--grad-band)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:px-6 md:py-20 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
        <div className="flex-1">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-ink-heading md:text-4xl">
            {dictionary.home.readingLists.title}
          </h2>
          <p className="mb-8 max-w-[60ch] text-lg text-ink-muted">
            {dictionary.home.readingLists.description}
          </p>
          <Link
            href={withLocalePath(lang, "reading-lists")}
            className="inline-flex items-center gap-1.5 rounded-[4px] bg-[image:var(--grad-brand)] px-6 py-2.5 font-medium text-white transition-[filter] hover:brightness-110"
          >
            {dictionary.home.readingLists.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Fanned stack of actual reading-list covers */}
        {covers.length > 0 && (
          <Link
            href={withLocalePath(lang, "reading-lists")}
            className="group relative mx-auto hidden h-56 w-96 shrink-0 sm:block"
            aria-label={dictionary.home.readingLists.viewAll}
          >
            {covers.map((list, index) => (
              <div
                key={list.id}
                className="absolute top-1/2 h-44 w-40 overflow-hidden rounded-md border border-rule-strong transition-opacity group-hover:opacity-90"
                style={{
                  left: `${index * 76}px`,
                  transform: `translateY(-50%) rotate(${(index - 1.5) * 3}deg)`,
                  zIndex: index,
                }}
              >
                <Image
                  src={withSiteUrl(list.coverImage!)}
                  alt={list.title}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-[hsl(260,30%,8%)]/80 px-2.5 py-1.5 backdrop-blur-sm">
                  <BookOpen className="h-3 w-3 shrink-0 text-primary-800" />
                  <span className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-ink-body">
                    {list.title}
                  </span>
                </div>
              </div>
            ))}
          </Link>
        )}
      </div>
    </section>
  );
}
