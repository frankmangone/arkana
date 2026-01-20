import { BookOpen } from "lucide-react";
import Link from "next/link";
import React from "react";
import Image from "next/image";

interface ReadingListsProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

// TODO: Do something about background
export function ReadingLists({ lang, dictionary }: ReadingListsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";

  return (
    <section className="relative flex flex-col justify-center w-full min-h-[80vh] py-8 md:py-20 mt-12 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-500/5 to-transparent"></div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-48 bg-gradient-to-r from-primary-500/20 to-orange-500/20 rounded-full blur-3xl"></div>

      <div className="relative flex flex-col-reverse md:flex-row gap-8 container mx-auto px-8 lg:py-8 md:px-6 lg:px-8 max-w-8xl z-10">
        <BookOpen className="hidden lg:block md:ml-0 shrink-0 w-12 h-12 text-primary-650" />
        <div className="md:max-w-70 lg:max-w-120 relative flex-shrink-0">
          {/* Background gradient orb behind the button */}
          <div className="absolute top-0 left-0 w-64 h-32 bg-gradient-to-r from-purple-500/15 to-primary-500/15 rounded-full blur-2xl -z-10"></div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {dictionary?.home?.readingLists?.title}
          </h1>
          <p className="text-gray-400 mb-12">
            {dictionary?.home?.readingLists?.description}
          </p>
          <Link
            href={`${baseUrl}/${lang}/reading-lists`}
            className="inline-block px-12 py-3 text-white transition-colors bg-primary-650 hover:bg-primary-750"
          >
            {dictionary?.home?.readingLists?.viewAll}
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <Image
            src="/reading-list-render.png"
            alt="Reading list interface preview"
            width={600}
            height={400}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
