import { BookOpen } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ReadingListsProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

// TODO: Do something about background
export function ReadingLists({ lang, dictionary }: ReadingListsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";

  return (
    <section className="relative w-full py-8">
      <div className="relative flex flex-row gap-8 container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-8xl z-10">
        <BookOpen className="ml-4 md:ml-0 shrink-0 w-12 h-12 text-primary-500" />
        <div className="md:max-w-120">
          <h1 className="text-4xl font-bold mb-2">
            {dictionary?.home?.readingLists?.title}
          </h1>
          <p className="text-gray-400 mb-12">
            {dictionary?.home?.readingLists?.description}
          </p>
          <Link
            href={`${baseUrl}/${lang}/reading-lists`}
            className="inline-block px-12 py-3 text-white transition-colors bg-primary-500 hover:bg-primary-600"
          >
            {dictionary?.home?.readingLists?.viewAll}
          </Link>
        </div>
      </div>
    </section>
  );
}
