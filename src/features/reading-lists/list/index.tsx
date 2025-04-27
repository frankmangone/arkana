import Link from "next/link";
import Image from "next/image";
import { ReadingList } from "@/lib/reading-lists";
import { EmptyState } from "@/components/empty-state";

interface ReadingListsPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
  lang: string;
  readingLists: ReadingList[];
}

export function ReadingListsPage(props: ReadingListsPageProps) {
  const { lang, dictionary, readingLists } = props;

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8">
        {dictionary.readingLists.list.title}
      </h1>
      <p className="text-lg mb-10 text-gray-600 dark:text-gray-300">
        {dictionary.readingLists.list.description}
      </p>

      {readingLists.length === 0 && (
        <EmptyState
          title={dictionary.readingLists.list.noLists}
          description={dictionary.readingLists.list.noListsDescription}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {readingLists.map((list) => (
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
                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-500">
                  {list.title}
                </h2>
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
        ))}
      </div>
    </div>
  );
}
