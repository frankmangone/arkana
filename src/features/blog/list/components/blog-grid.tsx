"use client";

import { useEffect, useMemo, useState } from "react";
import { PostPreview } from "@/lib/posts";
import { PostCard } from "@/components/ui/post-card";
import { Pagination } from "@/components/pagination";
import { getTagDisplayName } from "@/lib/tags";

const COLLAPSED_TAG_COUNT = 12;

const CHIP_BASE =
  "cursor-pointer rounded-[3px] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors";
const CHIP_INACTIVE = `${CHIP_BASE} border-rule text-ink-muted hover:border-rule-strong hover:text-ink-body`;
const CHIP_ACTIVE = `${CHIP_BASE} border-primary-700 text-primary-800`;

interface BlogGridLabels {
  filterByTag: string;
  allPosts: string;
  showAllTags: string;
  showFewerTags: string;
  noPosts: string;
  tryDifferentTag: string;
  viewAllPosts: string;
}

interface BlogGridProps {
  lang: string;
  /** Full corpus, for tag counts and filtered views. */
  allPosts: PostPreview[];
  /** The statically paginated slice shown when no tag is active. */
  pagePosts: PostPreview[];
  currentPage: number;
  totalPages: number;
  labels: BlogGridLabels;
}

export function BlogGrid(props: BlogGridProps) {
  const { lang, allPosts, pagePosts, currentPage, totalPages, labels } = props;

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Deep links: tags clicked on cards and article heroes land on
  // /blog/page/1?tag=<tag>
  useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get("tag");
    if (tag) setActiveTag(tag);
  }, []);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of allPosts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    );
  }, [allPosts]);

  const selectTag = (tag: string | null) => {
    const next = tag === activeTag ? null : tag;
    setActiveTag(next);
    const url = new URL(window.location.href);
    if (next) {
      url.searchParams.set("tag", next);
    } else {
      url.searchParams.delete("tag");
    }
    window.history.replaceState(null, "", url.toString());
  };

  const filtered = activeTag
    ? allPosts.filter((post) => post.tags.includes(activeTag))
    : null;
  const shownPosts = filtered ?? pagePosts;
  const visibleTags = expanded
    ? tagCounts
    : tagCounts.slice(0, COLLAPSED_TAG_COUNT);
  const hiddenCount = tagCounts.length - COLLAPSED_TAG_COUNT;

  return (
    <>
      <div className="mb-10">
        <p className="eyebrow mb-4 text-ink-faint">{labels.filterByTag}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectTag(null)}
            className={activeTag === null ? CHIP_ACTIVE : CHIP_INACTIVE}
          >
            {labels.allPosts}
          </button>
          {visibleTags.map(([tag, count]) => (
            <button
              key={tag}
              type="button"
              onClick={() => selectTag(tag)}
              className={tag === activeTag ? CHIP_ACTIVE : CHIP_INACTIVE}
            >
              {getTagDisplayName(tag, lang)}
              <span className="ml-1.5 font-normal opacity-60">{count}</span>
            </button>
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className={`${CHIP_INACTIVE} border-dashed`}
            >
              {expanded
                ? labels.showFewerTags
                : labels.showAllTags.replace("{count}", String(hiddenCount))}
            </button>
          )}
        </div>
      </div>

      {shownPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shownPosts.map((post) => (
              <PostCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>

          {/* Static pagination only applies to the unfiltered corpus; a
              filtered view shows every match at once */}
          {!activeTag && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/${lang}/blog`}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-ink-heading mb-2">
            {labels.noPosts}
          </h3>
          <p className="text-ink-muted mb-6">{labels.tryDifferentTag}</p>
          <button
            type="button"
            onClick={() => selectTag(null)}
            className="inline-block cursor-pointer rounded-[4px] border border-rule-strong px-6 py-3 text-ink-body transition-colors hover:border-primary-700 hover:text-ink-heading"
          >
            {labels.viewAllPosts}
          </button>
        </div>
      )}
    </>
  );
}
