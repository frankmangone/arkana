import Link from "next/link";
import Image from "next/image";
import { ReadingList } from "@/lib/reading-lists";

interface ReadingListCardProps {
  list: ReadingList;
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function ReadingListCard(props: ReadingListCardProps) {
  const { list, lang, dictionary } = props;

  return (
    <Link
      key={list.id}
      href={`/${lang}/reading-lists/${list.id}`}
      className="block group"
    >
      <div className="border rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-md">
        <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
          {list.coverImage ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                list.coverImage
              }`}
              alt={list.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="text-xl">No image</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-semibold group-hover:text-blue-500">
              {list.title}
            </h2>
            {list.ongoing && (
              <span className="hidden sm:flex text-xs font-medium px-2 py-0.5 rounded-full dark:bg-[#8041f450] dark:text-[#9f79e7] ml-2">
                {dictionary.readingLists.ongoing}
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {list.description}
          </p>
          <div className="text-sm text-gray-500">
            {list.items.length} article
            {list.items.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </Link>
  );
}
