"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { PostPreview } from "@/lib/posts";
import { PostCard } from "@/components/ui/post-card";
import { MasonryColumns } from "@/components/ui/masonry-columns";
import { ArkanaSpinner } from "@/components/ui/arkana-spinner";
import {
  EndOfFeed,
  MUTED_CROSS_GLYPH,
  MUTED_CROSS_COLOR,
} from "@/components/ui/end-of-feed";
import ArkanaPattern from "@/components/arkana-pattern";
import { useUnifiedSearch } from "@/lib/api/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { getTagDisplayName } from "@/lib/tags";
import { TagFilter, type TagFilterLabels } from "./tag-filter";

const DEBOUNCE_MS = 400;
const CHUNK_SIZE = 12;

interface BlogGridLabels extends TagFilterLabels {
  searchPlaceholder: string;
  searching: string;
  noPosts: string;
  noPostsDescription: string;
  clearSearch: string;
  endOfFeed: string;
}

interface BlogGridProps {
  lang: string;
  /** Full corpus, for mapping search hits to previews and as an offline fallback. */
  allPosts: PostPreview[];
  /** The statically rendered slice shown before hydration / with JS off. */
  pagePosts: PostPreview[];
  /** Index into `allPosts` where `pagePosts` starts; infinite scroll
   * continues forward through `allPosts` from there. */
  startIndex: number;
  labels: BlogGridLabels;
}

function parseTagsParam(): string[] {
  const raw = new URLSearchParams(window.location.search).get("tags");
  if (!raw) return [];
  return [...new Set(raw.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

function parseQueryParam(): string {
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

function writeSearchParams(query: string, tags: string[]) {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set("q", query);
  } else {
    url.searchParams.delete("q");
  }
  if (tags.length > 0) {
    url.searchParams.set("tags", tags.join(","));
  } else {
    url.searchParams.delete("tags");
  }
  window.history.replaceState(null, "", url.toString());
}

export function BlogGrid(props: BlogGridProps) {
  const { lang, allPosts, pagePosts, startIndex, labels } = props;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [term, setTerm] = useState("");
  const query = useDebouncedValue(term, DEBOUNCE_MS);

  // Deep links: tags/queries clicked anywhere land on /blog?q=<term>&tags=<a,b>.
  // The static HTML renders the unfiltered grid; the filter applies on mount.
  useEffect(() => {
    const tags = parseTagsParam();
    const q = parseQueryParam();
    if (tags.length > 0) setSelectedTags(tags);
    if (q) setTerm(q);
  }, []);

  useEffect(() => {
    writeSearchParams(query, selectedTags);
  }, [query, selectedTags]);

  const {
    data,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useUnifiedSearch({ query, tags: selectedTags, lang });

  const previewsBySlug = useMemo(
    () => new Map(allPosts.map((post) => [post.slug, post])),
    [allPosts]
  );

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]);
  };
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };
  const reset = () => {
    setSelectedTags([]);
    setTerm("");
  };

  const filtering = selectedTags.length > 0 || query.trim().length > 0;

  // Unfiltered browsing: infinite-scroll through the shipped corpus, 12 at
  // a time, continuing forward from wherever this page's static slice
  // started (usually 0, but a direct /blog/page/N link starts further in).
  const [visibleCount, setVisibleCount] = useState(pagePosts.length);
  const hasMoreLocal = !filtering && startIndex + visibleCount < allPosts.length;
  const loadMoreLocal = useCallback(() => {
    setVisibleCount((count) =>
      Math.min(count + CHUNK_SIZE, allPosts.length - startIndex)
    );
  }, [allPosts.length, startIndex]);
  const localSentinelRef = useInfiniteScrollTrigger(loadMoreLocal, hasMoreLocal);

  // Filtered browsing: infinite-scroll via the backend's offset paging.
  const loadMoreSearch = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);
  const searchSentinelRef = useInfiniteScrollTrigger(
    loadMoreSearch,
    filtering && !isError && !!hasNextPage
  );

  // Three sources, in order: the shipped corpus (no query/tags), search hits
  // mapped back to build-time previews, and — if the API is unreachable —
  // filtering the shipped corpus locally so search still works offline.
  let shownPosts: PostPreview[];
  if (!filtering) {
    shownPosts = allPosts.slice(startIndex, startIndex + visibleCount);
  } else if (data && !isError) {
    shownPosts = data.pages
      .flatMap((page) => page.hits)
      .map((hit) => previewsBySlug.get(hit.path))
      .filter((post): post is PostPreview => post !== undefined);
  } else if (isError) {
    const needle = query.trim().toLowerCase();
    shownPosts = allPosts.filter((post) => {
      const matchesTags = selectedTags.every((tag) => post.tags.includes(tag));
      const matchesQuery =
        !needle ||
        post.title.toLowerCase().includes(needle) ||
        post.description.toLowerCase().includes(needle);
      return matchesTags && matchesQuery;
    });
  } else {
    shownPosts = [];
  }

  const loading = filtering && !data && !isError;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="h-12 w-full rounded-md border-2 border-rule bg-white/5 pl-11 pr-4 text-sm text-ink-body placeholder:text-ink-faint transition-colors hover:border-rule-strong focus:border-primary-700 focus:bg-white/10 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>

        <TagFilter
          lang={lang}
          selectedTags={selectedTags}
          onAddTag={addTag}
          labels={labels}
        />
      </div>

      {selectedTags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-primary-700 py-1 pl-2.5 pr-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-800"
            >
              {getTagDisplayName(tag, lang)}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${getTagDisplayName(tag, lang)}`}
                className="cursor-pointer rounded-[2px] p-0.5 transition-colors hover:bg-white/10 hover:text-ink-heading"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <p className="flex items-center gap-2 py-12 text-ink-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {labels.searching}
        </p>
      ) : shownPosts.length > 0 ? (
        <>
          <MasonryColumns
            className={
              filtering && isFetching && !isFetchingNextPage ? "opacity-60" : ""
            }
            items={shownPosts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                lang={lang}
                clampDescription={false}
              />
            ))}
          />

          {!filtering &&
            (hasMoreLocal ? (
              <div ref={localSentinelRef} className="flex justify-center py-10">
                <ArkanaSpinner />
              </div>
            ) : (
              <EndOfFeed message={labels.endOfFeed} />
            ))}
          {filtering && !isError && (
            hasNextPage ? (
              <div ref={searchSentinelRef} className="flex justify-center py-10">
                <ArkanaSpinner />
              </div>
            ) : (
              <EndOfFeed message={labels.endOfFeed} />
            )
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <ArkanaPattern
            elements={MUTED_CROSS_GLYPH}
            canvasSize={48}
            lineColor={MUTED_CROSS_COLOR}
            backgroundColor="transparent"
            className="mx-auto mb-4"
          />
          <h3 className="mb-2 text-lg font-semibold text-ink-heading">
            {labels.noPosts}
          </h3>
          <p className="mb-6 text-sm text-ink-muted">
            {labels.noPostsDescription}
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-block cursor-pointer rounded-[4px] border border-rule-strong px-6 py-3 text-ink-body transition-colors hover:border-primary-700 hover:text-ink-heading"
          >
            {labels.clearSearch}
          </button>
        </div>
      )}
    </>
  );
}
