import Link from "next/link";
import Image from "next/image";
import { BookOpen, List } from "lucide-react";
import { ReadingListItem } from "@/lib/reading-lists";

interface ReadingList {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  ongoing?: boolean;
  items: Array<ReadingListItem>;
}

interface ReadingListCardProps {
  list: ReadingList;
  lang: string;
  dictionary: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function ReadingListCard(props: ReadingListCardProps) {
  const { list, lang, dictionary } = props;

  return (
    <div className="group">
      <Link href={`/${lang}/reading-lists/${list.id}`} className="block">
        {/* Image container with stacked appearance */}
        <div className="relative h-64 mb-4 hidden md:block">
          {list.coverImage ? (
            <>
              {/* Main image */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                    list.coverImage
                  }`}
                  alt={list.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-90" />
              </div>

              {/* Reading list icon */}
              <div className="absolute top-4 right-4 bg-black/70 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-primary-500" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg relative">
              <div className="absolute -bottom-1 -right-1 w-[calc(100%-8px)] h-[calc(100%-8px)] border border-gray-700 rounded-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-[calc(100%-16px)] h-[calc(100%-16px)] border border-gray-700 rounded-lg"></div>
              <List className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="flex items-start gap-4">
          <h2 className="grow-1 text-xl font-bold mb-2 text-primary-500 group-hover:text-primary-600 transition-colors line-clamp-1">
            {list.title}
          </h2>

          {list.ongoing && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-500">
              {dictionary.readingLists.ongoing}
            </span>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <BookOpen className="h-4 w-4 mr-2" />
            {list.items.length}{" "}
            {list.items.length === 1
              ? dictionary.readingLists.article
              : dictionary.readingLists.articles}
          </div>
        </div>

        <p className="text-gray-400 text-md mb-4 line-clamp-2">
          {list.description}
        </p>
      </Link>
    </div>
  );
}
