import { ReadingList } from "@/lib/reading-lists";
import { getDictionary } from "@/lib/dictionaries";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <header className="mb-12 pb-10 pt-8">
        <Breadcrumbs
          lang={lang}
          items={[
            { label: dict.readingLists.list.title, href: backUrl },
            { label: readingList.title },
          ]}
          className="mb-12"
        />
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <h1 className="display-title !text-[clamp(2.75rem,6vw,4.75rem)] text-primary-750">
            {readingList.title}
          </h1>
          {readingList.ongoing && (
            <Badge variant="outline">{dict.readingLists.ongoing}</Badge>
          )}
        </div>

        <p className="max-w-[60ch] text-xl text-ink-muted">
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
