import { ReadingList } from "@/lib/reading-lists";
import Link from "next/link";
import { ReadingListCard } from "./components/reading-list-card";
import { getDictionary } from "@/lib/dictionaries";

interface ReadingListPageProps {
  lang: string;
  readingList: ReadingList;
  // TODO: Improve this type
  posts: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function ReadingListPage(props: ReadingListPageProps) {
  const { lang, readingList, posts } = props;

  const dict = await getDictionary(lang);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const backUrl = `${basePath}/${lang}/reading-lists`;

  return (
    <div className="container py-12">
      <Link
        href={backUrl}
        className="text-blue-500 mb-6 inline-block hover:underline"
      >
        {dict.readingLists.view.back}
      </Link>

      <h1 className="text-4xl font-bold mb-4">{readingList.title}</h1>
      <p className="text-lg mb-10 text-gray-600 dark:text-gray-300">
        {readingList.description}
      </p>

      <div className="space-y-8">
        {posts.map((item, index) => (
          <ReadingListCard
            dictionary={dict}
            key={item.slug}
            item={item}
            index={index}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
