import Link from "next/link";
import { BookOpen, Clock, Layers, List } from "lucide-react";
import { ReadingListItem } from "@/lib/reading-lists";
import { Badge } from "@/components/ui/badge";
import { TintedThumbnail } from "@/components/ui/tinted-thumbnail";
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
  moduleCount: number;
  totalReadingTime: string;
}

export function ReadingListCard(props: ReadingListCardProps) {
  const { list, lang, dictionary, moduleCount, totalReadingTime } = props;
  const articleCount = list.items.length;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-md border border-rule transition-colors hover:border-rule-strong">
      <Link
        href={withLocalePath(lang, `reading-lists/${list.id}`)}
        className="flex h-full flex-col"
      >
        <div className="relative hidden h-48 shrink-0 overflow-hidden border-b border-rule md:block">
          {list.coverImage ? (
            <TintedThumbnail
              src={withSiteUrl(list.coverImage)}
              alt={list.title}
              sizes="(min-width: 1024px) 33vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-faint">
              <List className="h-10 w-10" />
            </div>
          )}

          {list.ongoing && (
            <Badge
              variant="outline"
              className="absolute right-3 top-3 bg-surface-page/80 backdrop-blur-sm"
            >
              {dictionary.readingLists.ongoing}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h2 className="mb-2 text-xl font-semibold tracking-tight text-ink-heading transition-colors group-hover:text-primary-800">
            {list.title}
          </h2>

          <p className="mb-4 line-clamp-2 text-sm text-ink-muted">
            {list.description}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
            <span className="inline-flex items-center">
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              {moduleCount}{" "}
              {moduleCount === 1
                ? dictionary.readingLists.moduleSingular
                : dictionary.readingLists.modulePlural}
            </span>
            <span className="inline-flex items-center">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              {articleCount}{" "}
              {articleCount === 1
                ? dictionary.readingLists.article
                : dictionary.readingLists.articles}
            </span>
            <span className="inline-flex items-center">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              {totalReadingTime}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
