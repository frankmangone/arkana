import { ReadingList } from "@/lib/reading-lists";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/post-card";

interface ReadingListPageProps {
  lang: string;
  readingList: ReadingList;
  // TODO: Improve this type
  posts: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function ReadingListPage(props: ReadingListPageProps) {
  const { lang, readingList, posts } = props;

  const dict = await getDictionary(lang);

  const backUrl = `/${lang}/reading-lists`;

  return (
    <div className="container">
      <Button asChild variant="outline" size="lg" className="rounded-none">
        <Link href={backUrl} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          {dict.readingLists.view.back}
        </Link>
      </Button>

      <div className="flex items-center gap-3 mb-4 mt-6">
        <h1 className="text-4xl font-bold">{readingList.title}</h1>
        {readingList.ongoing && (
          <span className="text-sm font-medium px-3 py-1 rounded-full dark:bg-[#8041f450] dark:text-[#9f79e7]">
            {dict.readingLists.ongoing}
          </span>
        )}
      </div>

      <p className="text-lg mb-10 text-gray-600 dark:text-gray-300">
        {readingList.description}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {posts.map((item) => (
          <PostCard
            key={item.slug}
            // TODO: Fix this definition, it should not be this convoluted
            post={{
              slug: item.slug,
              content: item.post.content,
              ...item.post.metadata,
            }}
            lang={lang}
          />
          // <ReadingListCard
          //   dictionary={dict}
          //   key={item.slug}
          //   item={item}
          //   index={index}
          //   lang={lang}
          // />
        ))}
      </div>
    </div>
  );
}
