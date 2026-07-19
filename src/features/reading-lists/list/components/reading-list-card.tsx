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
    <div className="group overflow-hidden rounded-md border border-rule transition-colors hover:border-rule-strong">
      <Link
        href={withLocalePath(lang, `reading-lists/${list.id}`)}
        className="flex flex-col md:flex-row"
      >
        {/* Cover panel */}
        <div className="relative hidden shrink-0 border-b border-rule md:block md:w-72 md:border-b-0 md:border-r lg:w-96">
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
                  sizes="(min-width: 1024px) 384px, 288px"
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

        <div className="flex flex-1 flex-col p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-heading transition-colors group-hover:text-primary-800 md:text-3xl">
              {list.title}
            </h2>

            {list.ongoing && (
              <Badge variant="outline">{dictionary.readingLists.ongoing}</Badge>
            )}
            <div className="ml-auto flex shrink-0 items-center text-sm text-ink-faint">
              <BookOpen className="mr-2 h-4 w-4" />
              {list.items.length}{" "}
              {list.items.length === 1
                ? dictionary.readingLists.article
                : dictionary.readingLists.articles}
            </div>
          </div>

          <p className="max-w-[70ch] mb-6 text-base text-ink-muted">
            {list.description}
          </p>

          {/* Contents preview */}
          {previewTitles.length > 0 && (
            <ol className="!m-0 mt-6 space-y-0 divide-y divide-rule border-t border-rule !p-0">
              {previewTitles.map((title, index) => (
                <li
                  key={title}
                  className="!m-0 flex items-baseline gap-4 py-3 before:!content-none"
                >
                  <span className="eyebrow shrink-0 tabular-nums text-primary-800">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-base text-ink-body">
                    {title}
                  </span>
                </li>
              ))}
              {remaining > 0 && (
                <li className="!m-0 flex items-baseline gap-4 py-3 before:!content-none">
                  <span className="eyebrow shrink-0 text-ink-faint">
                    +{remaining}
                  </span>
                  <span className="truncate text-base text-ink-faint">
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
