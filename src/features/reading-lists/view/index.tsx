import { ReadingList } from "@/lib/reading-lists";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/ui/post-card";
import { getPostsFromReadingList } from "./fetch";
import { withLocalePath } from "@/lib/site-config";

interface ReadingListPageProps {
  lang: string;
  readingList: ReadingList;
}

export async function ReadingListPage(props: ReadingListPageProps) {
  const { lang, readingList } = props;

  const dict = await getDictionary(lang);
  const backUrl = withLocalePath(lang, "reading-lists");

  const posts = await getPostsFromReadingList({ readingList, lang });

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
          <Badge variant="default" className="text-md rounded-none">
            {dict.readingLists.ongoing}
          </Badge>
        )}
      </div>

      <p className="text-lg mb-10 text-gray-600 dark:text-gray-300">
        {readingList.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((item, index) => {
          const readingListItem = readingList.items[index];
          const url = withLocalePath(
            lang,
            `reading-lists/${readingList.id}/${readingListItem.id}`
          );

          return (
            <PostCard
              key={item.slug}
              post={item}
              lang={lang}
              overrideUrl={url}
            />
          );
        })}
      </div>
    </div>
  );
}
