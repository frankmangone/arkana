import Link from "next/link";
import Image from "next/image";
import { BookOpen, List } from "lucide-react";
import { ReadingListItem } from "@/lib/reading-lists";
import { Badge } from "@/components/ui/badge";
import type { Dictionary } from "@/lib/dictionaries";
import { withLocalePath, withSiteUrl } from "@/lib/site-config";

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
  dictionary: Dictionary;
  previewTitles?: string[];
}

export function ReadingListCard(props: ReadingListCardProps) {
  const { list, lang, dictionary, previewTitles = [] } = props;
  const remaining = list.items.length - previewTitles.length;

  return (
    <div className="group h-full overflow-hidden rounded-md border border-rule transition-colors hover:border-rule-strong">
      <Link
        href={withLocalePath(lang, `reading-lists/${list.id}`)}
        className="flex h-full flex-col"
      >
        {/* Cover */}
        <div className="relative hidden h-52 border-b border-rule md:block">
          {list.coverImage ? (
            <>
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={
                    list.coverImage
                      ? withSiteUrl(list.coverImage)
                      : "/placeholder.svg"
                  }
                  alt={list.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Reading list icon */}
              <div className="absolute right-3 top-3 rounded-[3px] border border-rule bg-surface-page/80 p-2 backdrop-blur-sm">
                <BookOpen className="h-4 w-4 text-primary-800" />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-ink-faint">
              <List className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-start gap-3">
            <h2 className="grow-1 line-clamp-1 text-xl font-semibold tracking-tight text-ink-heading transition-colors group-hover:text-primary-800">
              {list.title}
            </h2>

            {list.ongoing && (
              <Badge variant="outline">{dictionary.readingLists.ongoing}</Badge>
            )}
            <div className="flex shrink-0 items-center text-sm text-ink-faint">
              <BookOpen className="mr-2 h-4 w-4" />
              {list.items.length}{" "}
              {list.items.length === 1
                ? dictionary.readingLists.article
                : dictionary.readingLists.articles}
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-ink-muted">
            {list.description}
          </p>

          {/* Contents preview */}
          {previewTitles.length > 0 && (
            <ol className="!m-0 mt-5 flex-1 space-y-0 divide-y divide-rule border-t border-rule !p-0">
              {previewTitles.map((title, index) => (
                <li
                  key={title}
                  className="!m-0 flex items-baseline gap-3 py-2.5 before:!content-none"
                >
                  <span className="eyebrow shrink-0 tabular-nums text-primary-800">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-sm text-ink-body">
                    {title}
                  </span>
                </li>
              ))}
              {remaining > 0 && (
                <li className="!m-0 flex items-baseline gap-3 py-2.5 before:!content-none">
                  <span className="eyebrow shrink-0 text-ink-faint">
                    +{remaining}
                  </span>
                  <span className="truncate text-sm text-ink-faint">
                    {dictionary.readingLists.articles}
                  </span>
                </li>
              )}
            </ol>
          )}
        </div>
      </Link>
    </div>
  );
}
