import { ReadingList } from "@/lib/reading-lists";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
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
      <Link
        href={backUrl}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink-heading"
      >
        <ArrowLeft size={16} />
        {dict.readingLists.view.back}
      </Link>

      <header className="mb-10 mt-6 border-b border-rule pb-6">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-ink-heading md:text-5xl">
            {readingList.title}
          </h1>
          {readingList.ongoing && (
            <Badge variant="outline">{dict.readingLists.ongoing}</Badge>
          )}
        </div>

        <p className="max-w-[60ch] text-lg text-ink-muted">
          {readingList.description}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((item, index) => {
          const readingListItem = readingList.items[index];
          const url = withLocalePath(
            lang,
            `reading-lists/${readingList.id}/${readingListItem.id}`
          );

          return (
            <div key={item.slug} className="flex flex-col gap-2">
              <span className="eyebrow tabular-nums text-ink-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <PostCard post={item} lang={lang} overrideUrl={url} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
